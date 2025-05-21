import { expenseApi } from './api';
import { Expense } from '@/context/ExpenseContext';
import { Platform } from 'react-native';

export async function syncData(
  localExpenses: Expense[],
  lastSynced: string | null
): Promise<{ serverExpenses: Expense[]; successfulSync: boolean }> {
  try {
    // For web, simpler sync strategy - just use server data
    if (Platform.OS === 'web') {
      const serverExpenses = await expenseApi.getExpenses();
      return { serverExpenses, successfulSync: true };
    }

    // For mobile, use timestamp-based sync
    // 1. Get unsyncedItems first (created or modified locally)
    const unsyncedItems = localExpenses.filter(item => !item.synced);

    if (unsyncedItems.length > 0) {
      // 2. Send unsynced items to server
      await expenseApi.batchSync(unsyncedItems);
    }

    // 3. Get all latest data from server (including our synced items)
    const serverExpenses = await expenseApi.getExpenses(lastSynced || undefined);

    // 4. Merge server data (using server data as source of truth)
    const mergedExpenses = mergeExpenses(localExpenses, serverExpenses);

    return { serverExpenses: mergedExpenses, successfulSync: true };
  } catch (error) {
    console.error('Sync failed:', error);
    return { serverExpenses: localExpenses, successfulSync: false };
  }
}

// Merge expenses, using server data as source of truth for conflicts
function mergeExpenses(localExpenses: Expense[], serverExpenses: Expense[]): Expense[] {
  // Create a map of server expenses by ID for faster lookups
  const serverExpensesMap = new Map<string, Expense>();
  serverExpenses.forEach(expense => {
    if (expense._id) {
      serverExpensesMap.set(expense._id, { ...expense, synced: true });
    }
  });

  // Process local expenses, checking for conflicts
  const result: Expense[] = [];
  const processedIds = new Set<string>();

  // Add all local expenses that aren't on the server
  localExpenses.forEach(localExpense => {
    const serverId = localExpense._id;
    
    // If it has a server ID, check if the server has a newer version
    if (serverId && serverExpensesMap.has(serverId)) {
      const serverExpense = serverExpensesMap.get(serverId)!;
      const localUpdatedAt = new Date(localExpense.updatedAt).getTime();
      const serverUpdatedAt = new Date(serverExpense.updatedAt).getTime();
      
      // Use server version if it's newer or same time
      if (serverUpdatedAt >= localUpdatedAt) {
        result.push(serverExpense);
      } else {
        // Use local version if it's newer, but mark it for sync
        result.push({ ...localExpense, synced: false });
      }
      
      processedIds.add(serverId);
    } 
    // For local-only items that have not been synced yet
    else if (!serverId || !serverExpensesMap.has(serverId)) {
      result.push(localExpense);
    }
  });

  // Add any server expenses that weren't in local database
  serverExpenses.forEach(serverExpense => {
    if (serverExpense._id && !processedIds.has(serverExpense._id)) {
      result.push({ ...serverExpense, synced: true });
    }
  });

  return result;
}