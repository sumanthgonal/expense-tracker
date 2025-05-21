import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  border: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  shadow: string;
};

interface ThemeContextProps {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  currentTheme: 'light' | 'dark' | 'system';
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  card: '#F9FAFB',
  text: '#1F2937',
  secondaryText: '#6B7280',
  border: '#E5E7EB',
  primary: '#0CB6AD',
  secondary: '#8B5CF6',
  accent: '#FC5C65',
  success: '#10B981',
  warning: '#FBBF24',
  error: '#EF4444',
  shadow: '#000000',
};

const darkColors: ThemeColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#F9FAFB',
  secondaryText: '#9CA3AF',
  border: '#374151',
  primary: '#0CB6AD',
  secondary: '#A78BFA',
  accent: '#FC5C65',
  success: '#34D399',
  warning: '#FCD34D',
  error: '#F87171',
  shadow: '#000000',
};

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });
    
    return () => subscription.remove();
  }, []);
  
  const isDark = currentTheme === 'system' 
    ? systemTheme === 'dark'
    : currentTheme === 'dark';
  
  const colors = isDark ? darkColors : lightColors;
  
  const toggleTheme = () => {
    if (currentTheme === 'system') {
      setCurrentTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setCurrentTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }
  };
  
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setCurrentTheme(theme);
  };
  
  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};