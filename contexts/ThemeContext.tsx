
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    gradient: string[];
  };
}

export const THEMES: AppTheme[] = [
  {
    id: 'momentum',
    name: 'Momentum',
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      border: '#334155',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: ['#6366F1', '#8B5CF6'],
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      background: '#0C4A6E',
      surface: '#075985',
      text: '#F0F9FF',
      textSecondary: '#BAE6FD',
      border: '#0369A1',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: ['#0EA5E9', '#06B6D4'],
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      background: '#064E3B',
      surface: '#065F46',
      text: '#ECFDF5',
      textSecondary: '#A7F3D0',
      border: '#047857',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: ['#10B981', '#34D399'],
    },
  },
];

interface ThemeContextType {
  currentTheme: AppTheme;
  setTheme: (themeId: string) => void;
  themes: AppTheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(THEMES[0]);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem('app_theme');
      if (savedThemeId) {
        const theme = THEMES.find(t => t.id === savedThemeId);
        if (theme) {
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      try {
        await AsyncStorage.setItem('app_theme', themeId);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default theme if context not available
    console.log('ThemeContext not available, returning default theme');
    return {
      currentTheme: THEMES[0],
      setTheme: () => {},
      themes: THEMES,
    };
  }
  return context;
}
