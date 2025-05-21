import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useExpenses } from '@/context/ExpenseContext';
import { useTheme } from '@/context/ThemeContext';
import ScreenContainer from '@/components/ScreenContainer';
import ExpenseSummary from '@/components/ExpenseSummary';
import ExpenseCard from '@/components/ExpenseCard';
import EmptyState from '@/components/EmptyState';
import { CreditCard, Signal } from 'lucide-react-native';

export default function Dashboard() {
  const { colors } = useTheme();
  const { expenses, loading, error, deleteExpense, syncExpenses, isOnline } = useExpenses();
  
  // Get recent expenses (last 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const handleRefresh = () => {
    syncExpenses();
  };
  
  return (
    <ScreenContainer
      refreshing={loading}
      onRefresh={handleRefresh}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Your expense summary
          </Text>
        </View>
        
        {/* Connection status indicator */}
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: isOnline ? colors.success : colors.error }
        ]}>
          <Signal size={14} color="#FFFFFF" />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>
      
      <ExpenseSummary />
      
      <View style={styles.recentContainer}>
        <Text style={[styles.recentTitle, { color: colors.text }]}>
          Recent Expenses
        </Text>
        
        {recentExpenses.length > 0 ? (
          recentExpenses.map(expense => (
            <ExpenseCard
              key={expense._id || expense.id}
              expense={expense}
              onDelete={deleteExpense}
            />
          ))
        ) : (
          <EmptyState message="No recent expenses. Add your first expense!" />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  recentContainer: {
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
});