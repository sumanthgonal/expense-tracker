import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ScreenContainer({ 
  children, 
  scrollable = true,
  style,
  refreshing = false,
  onRefresh,
}: ScreenContainerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const containerStyle = [
    styles.container,
    { 
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'ios' ? insets.top : 0,
      paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
      paddingLeft: Platform.OS === 'ios' ? insets.left : 0,
      paddingRight: Platform.OS === 'ios' ? insets.right : 0,
    },
    style
  ];
  
  if (scrollable) {
    return (
      <ScrollView 
        style={containerStyle}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    );
  }
  
  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
});