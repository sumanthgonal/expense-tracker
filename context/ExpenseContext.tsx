import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { expenseApi } from '@/services/api';
import { syncData } from '@/services/syncService';

export type Category = 
  | 'food' 
  | 'transport' 
  | 'entertainment' 
  | 'shopping' 
  | 'utilities' 
  | 'health' 
  | 'travel' 
  | 'education' 
  | 'other';

export interface Expense {
  _id?: string;
  id?: string;
  amount: number;
  category: Category;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  synced?: boolean;
  deleted?: boolean;
}

interface ExpenseContextProps {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  addExpense: (expense: Omit<Expense, '_id' | 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  syncExpenses: () => Promise<void>;
  isOnline: boolean;
  totalByCategory: Record<Category, number>;
}

const ExpenseContext = createContext<ExpenseContextProps | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  // Calculate totals by category with safety checks
  const totalByCategory = expenses && Array.isArray(expenses) ? expenses.reduce((acc, expense) => {
    if (!expense.deleted) {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    }
    return acc;
  }, {} as Record<Category, number>) : {} as Record<Category, number>;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load local data first
        const localData = await AsyncStorage.getItem('expenses');
        let localExpenses: Expense[] = [];
        
        try {
          const parsedData = localData ? JSON.parse(localData) : [];
          // Ensure parsed data is an array
          if (Array.isArray(parsedData)) {
            localExpenses = parsedData;
          }
        } catch (parseError) {
          console.error('Failed to parse local expenses:', parseError);
        }
        
        setExpenses(localExpenses);
        
        // Try to sync with server if on web or network is available
        if (Platform.OS === 'web' || isOnline) {
          await syncExpenses();
        }
      } catch (err) {
        setError('Failed to load expenses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
    
    // Set up periodic sync if not on web
    if (Platform.OS !== 'web') {
      const syncInterval = setInterval(() => {
        if (isOnline) {
          syncExpenses();
        }
      }, 60000); // Sync every minute if online
      
      return () => clearInterval(syncInterval);
    }
  }, [isOnline]);
  
  const saveLocalExpenses = async (updatedExpenses: Expense[]) => {
    try {
      // Ensure we're saving an array
      const expensesToSave = Array.isArray(updatedExpenses) ? updatedExpenses : [];
      await AsyncStorage.setItem('expenses', JSON.stringify(expensesToSave));
    } catch (err) {
      console.error('Failed to save expenses locally', err);
    }
  };
  
  const addExpense = async (expense: Omit<Expense, '_id' | 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => {
    try {
      const timestamp = new Date().toISOString();
      const newExpense: Expense = {
        ...expense,
        id: `local_${Date.now()}`,
        createdAt: timestamp,
        updatedAt: timestamp,
        synced: false,
      };
      
      // Ensure we're working with an array
      const currentExpenses = Array.isArray(expenses) ? expenses : [];
      const updatedExpenses = [...currentExpenses, newExpense];
      setExpenses(updatedExpenses);
      await saveLocalExpenses(updatedExpenses);
      
      // If online, sync immediately
      if (isOnline) {
        syncExpenses();
      }
    } catch (err) {
      setError('Failed to add expense');
      console.error(err);
    }
  };
  
  const deleteExpense = async (id: string) => {
    try {
      // Ensure we're working with an array
      const currentExpenses = Array.isArray(expenses) ? expenses : [];
      const updatedExpenses = currentExpenses.map(exp => 
        (exp.id === id || exp._id === id) 
          ? { ...exp, deleted: true, updatedAt: new Date().toISOString(), synced: false } 
          : exp
      );
      
      setExpenses(updatedExpenses);
      await saveLocalExpenses(updatedExpenses);
      
      // If online, sync the deletion
      if (isOnline) {
        syncExpenses();
      }
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
    }
  };
  
  const syncExpenses = async () => {
    if (Platform.OS === 'web' || isOnline) {
      try {
        // Ensure we're working with an array when syncing
        const currentExpenses = Array.isArray(expenses) ? expenses : [];
        const { serverExpenses, successfulSync } = await syncData(currentExpenses, lastSynced);
        
        if (successfulSync && Array.isArray(serverExpenses)) {
          setExpenses(serverExpenses);
          await saveLocalExpenses(serverExpenses);
          setLastSynced(new Date().toISOString());
        }
      } catch (err) {
        console.error('Sync failed', err);
        setIsOnline(false);
      }
    }
  };
  
  return (
    <ExpenseContext.Provider
      value={{
        expenses: Array.isArray(expenses) ? expenses.filter(exp => !exp.deleted) : [],
        loading,
        error,
        addExpense,
        deleteExpense,
        syncExpenses,
        isOnline,
        totalByCategory,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = (): ExpenseContextProps => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};