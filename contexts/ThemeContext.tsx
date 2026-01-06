
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    accent: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'zen-light',
    name: 'Zen Light',
    colors: {
      primary: '#6B4EFF',
      background: '#F8F7F4',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#6B6B6B',
      border: '#E5E5E5',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      accent: '#6B4EFF',
    },
  },
  {
    id: 'zen-dark',
    name: 'Zen Dark',
    colors: {
      primary: '#8B6EFF',
      background: '#0A0A0A',
      surface: '#1C1C1E',
      text: '#FFFFFF',
      textSecondary: '#98989D',
      border: '#2C2C2E',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      accent: '#8B6EFF',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0EA5E9',
      background: '#F0F9FF',
      surface: '#FFFFFF',
      text: '#0C4A6E',
      textSecondary: '#64748B',
      border: '#E0F2FE',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      accent: '#0EA5E9',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#059669',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#064E3B',
      textSecondary: '#6B7280',
      border: '#D1FAE5',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      accent: '#059669',
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState<Theme>(
    systemColorScheme === 'dark' ? THEMES[1] : THEMES[0]
  );

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem('app_theme');
      if (savedThemeId) {
        const theme = THEMES.find((t) => t.id === savedThemeId);
        if (theme) {
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (themeId: string) => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      try {
        await AsyncStorage.setItem('app_theme', themeId);
      } catch (error) {
        console.error('Failed to save theme:', error);
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
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
}
