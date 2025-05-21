import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, Platform } from 'react-native';
import { useExpenses, Category } from '@/context/ExpenseContext';
import { useTheme } from '@/context/ThemeContext';
import ScreenContainer from '@/components/ScreenContainer';
import ExpenseCard from '@/components/ExpenseCard';
import EmptyState from '@/components/EmptyState';
import { Calendar, Filter, Download, X } from 'lucide-react-native';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { expenseApi } from '@/services/api';

type DateFilter = 'all' | 'today' | 'week' | 'month';
type CategoryFilter = Category | 'all';

export default function History() {
  const { colors } = useTheme();
  const { expenses, loading, deleteExpense, syncExpenses } = useExpenses();
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];
    
    // Apply date filter
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= monthAgo;
        });
        break;
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }
    
    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, dateFilter, categoryFilter]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncExpenses();
    setRefreshing(false);
  }, [syncExpenses]);
  
  const handleExport = async () => {
    try {
      if (Platform.OS === 'web') {
        const csvUrl = await expenseApi.exportCSV();
        const link = document.createElement('a');
        link.href = csvUrl;
        link.download = 'expenses.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(csvUrl);
      } else {
        const csvContent = expenses.map(expense => 
          `${expense.date},${expense.description},${expense.category},${expense.amount}`
        ).join('\n');
        
        const header = 'Date,Description,Category,Amount\n';
        const fullContent = header + csvContent;
        
        const filePath = `${FileSystem.documentDirectory}expenses.csv`;
        await FileSystem.writeAsStringAsync(filePath, fullContent);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };
  
  const handleEdit = (expense: typeof expenses[0]) => {
    router.push({
      pathname: '/(tabs)/add',
      params: { id: expense._id || expense.id }
    });
  };
  
  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Expense History
        </Text>
        
        <View style={styles.filterContainer}>
          <Pressable 
            style={[
              styles.filterButton, 
              { 
                backgroundColor: colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={16} color={colors.primary} />
            <Text style={[styles.filterText, { color: colors.text }]}>
              Filters
            </Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.filterButton, 
              { 
                backgroundColor: colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={handleExport}
          >
            <Download size={16} color={colors.primary} />
            <Text style={[styles.filterText, { color: colors.text }]}>
              Export CSV
            </Text>
          </Pressable>
        </View>
      </View>
      
      {filteredExpenses.length > 0 ? (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item._id || item.id || item.createdAt}
          renderItem={({ item }) => (
            <ExpenseCard 
              expense={item} 
              onDelete={deleteExpense}
              onEdit={() => handleEdit(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing || loading}
        />
      ) : (
        <EmptyState message="No expenses found. Add your first expense!" />
      )}
      
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
            <Pressable onPress={() => setShowFilters(false)}>
              <X size={24} color={colors.text} />
            </Pressable>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Date Range</Text>
            <View style={styles.filterOptions}>
              {(['all', 'today', 'week', 'month'] as DateFilter[]).map((filter) => (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterOption,
                    { 
                      backgroundColor: dateFilter === filter ? colors.primary : colors.card,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => setDateFilter(filter)}
                >
                  <Text 
                    style={[
                      styles.filterOptionText,
                      { color: dateFilter === filter ? '#FFFFFF' : colors.text }
                    ]}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Category</Text>
            <View style={styles.filterOptions}>
              {(['all', 'food', 'transport', 'entertainment', 'shopping', 'utilities', 'health', 'travel', 'education', 'other'] as CategoryFilter[]).map((filter) => (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterOption,
                    { 
                      backgroundColor: categoryFilter === filter ? colors.primary : colors.card,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => setCategoryFilter(filter)}
                >
                  <Text 
                    style={[
                      styles.filterOptionText,
                      { color: categoryFilter === filter ? '#FFFFFF' : colors.text }
                    ]}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});