import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useExpenses, Category } from '@/context/ExpenseContext';
import { getCategoryColor } from './ExpenseCard';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function ExpenseSummary() {
  const { colors } = useTheme();
  const { expenses, totalByCategory } = useExpenses();
  
  // Calculate total amount
  const totalAmount = Object.values(totalByCategory).reduce((sum, amount) => sum + amount, 0);
  
  // Get top categories sorted by amount
  const topCategories = Object.entries(totalByCategory)
    .sort(([, amountA], [, amountB]) => amountB - amountA)
    .slice(0, 3);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Total Expenses
      </Text>
      
      <Text style={[styles.totalAmount, { color: colors.primary }]}>
        {formatCurrency(totalAmount)}
      </Text>
      
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      
      <View style={styles.categoriesContainer}>
        {topCategories.map(([category, amount]) => (
          <View key={category} style={styles.categoryRow}>
            <View style={styles.categoryLabelContainer}>
              <View 
                style={[
                  styles.categoryIndicator, 
                  { backgroundColor: getCategoryColor(category) }
                ]} 
              />
              <Text style={[styles.categoryLabel, { color: colors.text }]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </View>
            <Text style={[styles.categoryAmount, { color: colors.secondaryText }]}>
              {formatCurrency(amount)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  categoriesContainer: {
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  categoryAmount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});