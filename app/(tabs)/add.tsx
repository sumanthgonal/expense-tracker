import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Modal
} from 'react-native';
import { useExpenses, Category } from '@/context/ExpenseContext';
import { useTheme } from '@/context/ThemeContext';
import ScreenContainer from '@/components/ScreenContainer';
import CategoryPicker from '@/components/CategoryPicker';
import { Calendar } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddExpense() {
  const { colors } = useTheme();
  const { addExpense } = useExpenses();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [date, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimals
    const filtered = text.replace(/[^0-9.]/g, '');
    setAmount(filtered);
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const handleSubmit = async () => {
    setError(null);
    
    // Validate inputs
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await addExpense({
        amount: parseFloat(amount),
        description,
        category,
        date: date.toISOString(),
      });
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('food');
      setDate(new Date());
      
      // Show success animation before navigating
      setTimeout(() => {
        router.navigate('/(tabs)');
      }, 1000);
    } catch (err) {
      setError('Failed to add expense. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScreenContainer>
        <Text style={[styles.title, { color: colors.text }]}>Add Expense</Text>
        
        {error && (
          <Animated.View 
            entering={FadeInUp} 
            exiting={FadeOut}
            style={[styles.errorContainer, { backgroundColor: colors.error }]}
          >
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}
        
        <View style={styles.formContainer}>
          <View style={styles.amountContainer}>
            <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
            <TextInput
              style={[
                styles.amountInput, 
                { 
                  color: colors.text,
                  borderBottomColor: colors.border,
                }
              ]}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor={colors.secondaryText}
              keyboardType="numeric"
              autoFocus
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="What was this expense for?"
              placeholderTextColor={colors.secondaryText}
            />
          </View>
          
          <CategoryPicker 
            selectedCategory={category}
            onSelectCategory={setCategory}
          />
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Date</Text>
            <Pressable
              style={[
                styles.dateInput, 
                { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: colors.text }}>
                {date.toLocaleDateString()}
              </Text>
              <Calendar size={20} color={colors.primary} />
            </Pressable>
          </View>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
              textColor={colors.text}
            />
          )}
          
          <TouchableOpacity
            style={[
              styles.submitButton, 
              { 
                backgroundColor: colors.primary,
                opacity: isSubmitting ? 0.7 : 1,
              }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 24,
  },
  errorContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: 'white',
    fontFamily: 'Inter-Medium',
  },
  formContainer: {
    gap: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 32,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontFamily: 'Inter-SemiBold',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});