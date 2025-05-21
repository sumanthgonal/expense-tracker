import { Tabs } from 'expo-router';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { BarChart3, Plus, History, Settings } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue, 
  interpolateColor 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';

function TabBarIcon({ Icon, isFocused }: { Icon: typeof BarChart3, isFocused: boolean }) {
  const { colors } = useTheme();
  const animatedOpacity = useSharedValue(isFocused ? 1 : 0.5);
  
  useEffect(() => {
    animatedOpacity.value = withTiming(isFocused ? 1 : 0.5, { duration: 200 });
  }, [isFocused]);
  
  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: animatedOpacity.value,
      transform: [{ scale: interpolateColor(animatedOpacity.value, [0.5, 1], [0.9, 1]) }]
    };
  });
  
  return (
    <Animated.View style={animatedStyles}>
      <Icon size={24} color={colors.primary} strokeWidth={2} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60 + (Platform.OS === 'ios' ? insets.bottom : 0),
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 6,
          paddingTop: 6,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabBarIcon Icon={BarChart3} isFocused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ focused }) => <TabBarIcon Icon={Plus} isFocused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabBarIcon Icon={History} isFocused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabBarIcon Icon={Settings} isFocused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});