import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Category } from '@/context/ExpenseContext';
import { getCategoryColor } from './ExpenseCard';

type CategoryPickerProps = {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
};

const CATEGORIES: Category[] = [
  'food',
  'transport',
  'entertainment',
  'shopping',
  'utilities',
  'health',
  'travel',
  'education',
  'other'
];

export default function CategoryPicker({ selectedCategory, onSelectCategory }: CategoryPickerProps) {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Category</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((category) => {
          const isSelected = category === selectedCategory;
          const categoryColor = getCategoryColor(category);
          
          return (
            <Pressable
              key={category}
              style={[
                styles.categoryButton,
                { 
                  backgroundColor: isSelected ? categoryColor : 'transparent',
                  borderColor: categoryColor,
                }
              ]}
              onPress={() => onSelectCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryText, 
                  { 
                    color: isSelected 
                      ? isDark ? '#000000' : '#FFFFFF'
                      : categoryColor 
                  }
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});