import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useExpenses } from '@/context/ExpenseContext';
import ScreenContainer from '@/components/ScreenContainer';
import { Moon, Sun, RefreshCw, Download, Info } from 'lucide-react-native';

export default function Settings() {
  const { colors, isDark, toggleTheme, setTheme, currentTheme } = useTheme();
  const { syncExpenses, isOnline } = useExpenses();
  
  const handleSync = () => {
    syncExpenses();
  };
  
  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        
        <View 
          style={[
            styles.settingItem, 
            { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }
          ]}
        >
          <View style={styles.settingTextContainer}>
            <View style={styles.settingIconContainer}>
              {isDark ? (
                <Moon size={20} color={colors.primary} />
              ) : (
                <Sun size={20} color={colors.primary} />
              )}
            </View>
            <Text style={[styles.settingText, { color: colors.text }]}>
              Dark Mode
            </Text>
          </View>
          
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View 
          style={[
            styles.themeSelector, 
            { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }
          ]}
        >
          <Pressable
            style={[
              styles.themeOption,
              currentTheme === 'light' && [styles.selectedTheme, { borderColor: colors.primary }]
            ]}
            onPress={() => setTheme('light')}
          >
            <Text style={[
              styles.themeText, 
              { color: currentTheme === 'light' ? colors.primary : colors.text }
            ]}>
              Light
            </Text>
          </Pressable>
          
          <Pressable
            style={[
              styles.themeOption,
              currentTheme === 'dark' && [styles.selectedTheme, { borderColor: colors.primary }]
            ]}
            onPress={() => setTheme('dark')}
          >
            <Text style={[
              styles.themeText, 
              { color: currentTheme === 'dark' ? colors.primary : colors.text }
            ]}>
              Dark
            </Text>
          </Pressable>
          
          <Pressable
            style={[
              styles.themeOption,
              currentTheme === 'system' && [styles.selectedTheme, { borderColor: colors.primary }]
            ]}
            onPress={() => setTheme('system')}
          >
            <Text style={[
              styles.themeText, 
              { color: currentTheme === 'system' ? colors.primary : colors.text }
            ]}>
              System
            </Text>
          </Pressable>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sync</Text>
        
        <Pressable
          style={[
            styles.settingItem, 
            { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: isOnline ? 1 : 0.5,
            }
          ]}
          onPress={handleSync}
          disabled={!isOnline}
        >
          <View style={styles.settingTextContainer}>
            <View style={styles.settingIconContainer}>
              <RefreshCw size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.settingText, { color: colors.text }]}>
                Sync Data
              </Text>
              <Text style={[styles.settingSubtext, { color: colors.secondaryText }]}>
                {isOnline ? 'Sync your expenses with the server' : 'Offline - Connect to network to sync'}
              </Text>
            </View>
          </View>
        </Pressable>
        
        <Pressable
          style={[
            styles.settingItem, 
            { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }
          ]}
        >
          <View style={styles.settingTextContainer}>
            <View style={styles.settingIconContainer}>
              <Download size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.settingText, { color: colors.text }]}>
                Export Data
              </Text>
              <Text style={[styles.settingSubtext, { color: colors.secondaryText }]}>
                Export your expenses as a CSV file
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        
        <View 
          style={[
            styles.settingItem, 
            { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }
          ]}
        >
          <View style={styles.settingTextContainer}>
            <View style={styles.settingIconContainer}>
              <Info size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.settingText, { color: colors.text }]}>
                Version
              </Text>
              <Text style={[styles.settingSubtext, { color: colors.secondaryText }]}>
                1.0.0
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  settingSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  themeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedTheme: {
    borderBottomWidth: 2,
  },
  themeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});