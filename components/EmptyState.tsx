import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ReceiptText } from 'lucide-react-native';

type EmptyStateProps = {
  message?: string;
};

export default function EmptyState({ message = 'No expenses found' }: EmptyStateProps) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <ReceiptText size={64} color={colors.secondaryText} strokeWidth={1} />
      <Text style={[styles.message, { color: colors.secondaryText }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});