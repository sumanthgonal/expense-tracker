import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Trash2, CreditCard as Edit } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Expense } from '@/context/ExpenseContext';
import Animated, { 
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const SWIPE_THRESHOLD = -80;

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
  onEdit: () => void;
}

export const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    food: '#10B981',         // Green
    transport: '#3B82F6',    // Blue
    entertainment: '#8B5CF6', // Purple
    shopping: '#EC4899',     // Pink
    utilities: '#F59E0B',    // Amber
    health: '#EF4444',       // Red
    travel: '#0EA5E9',       // Light Blue
    education: '#6366F1',    // Indigo
    other: '#6B7280',        // Gray
  };
  
  return categoryColors[category] || '#6B7280';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function ExpenseCard({ expense, onDelete, onEdit }: ExpenseCardProps) {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const categoryColor = getCategoryColor(expense.category);
  
  const handleDelete = () => {
    if (expense._id || expense.id) {
      onDelete(expense._id || expense.id!);
    }
  };
  
  const panGesture = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = Math.min(0, event.translationX);
    },
    onEnd: (event) => {
      const shouldDelete = translateX.value < SWIPE_THRESHOLD;
      if (shouldDelete) {
        runOnJS(handleDelete)();
        translateX.value = withSpring(0);
      } else {
        translateX.value = withSpring(0);
      }
    },
  });
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  
  const deleteIconStyle = useAnimatedStyle(() => {
    const opacity = Math.min(1, Math.abs(translateX.value / SWIPE_THRESHOLD));
    
    return {
      opacity,
      transform: [
        { 
          scale: withSpring(translateX.value < SWIPE_THRESHOLD ? 1.1 : 1) 
        }
      ],
    };
  });
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.deleteContainer, deleteIconStyle]}>
        <Trash2 color={colors.error} size={24} />
      </Animated.View>
      
      <PanGestureHandler onGestureEvent={panGesture}>
        <Animated.View 
          style={[
            styles.card, 
            animatedStyle,
            { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            }
          ]}
        >
          <View style={styles.categoryIndicator} backgroundColor={categoryColor} />
          
          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={[styles.description, { color: colors.text }]}>
                {expense.description}
              </Text>
              <Text style={[styles.amount, { color: colors.primary }]}>
                {formatCurrency(expense.amount)}
              </Text>
            </View>
            
            <View style={styles.row}>
              <View style={styles.categoryContainer}>
                <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                <Text style={[styles.category, { color: colors.secondaryText }]}>
                  {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                </Text>
              </View>
              <View style={styles.actionsContainer}>
                <Text style={[styles.date, { color: colors.secondaryText }]}>
                  {formatDate(expense.date)}
                </Text>
                <Pressable 
                  style={styles.editButton} 
                  onPress={onEdit}
                >
                  <Edit size={16} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 16,
  },
  deleteContainer: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  categoryIndicator: {
    width: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  category: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  editButton: {
    padding: 4,
  },
});