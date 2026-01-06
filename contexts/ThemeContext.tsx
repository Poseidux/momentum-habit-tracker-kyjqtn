
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
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
    cardBackground: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    colors: {
      primary: '#0EA5E9',
      secondary: '#06B6D4',
      background: '#F0F9FF',
      surface: '#FFFFFF',
      text: '#0C4A6E',
      textSecondary: '#64748B',
      border: '#BAE6FD',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      cardBackground: '#E0F2FE',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    colors: {
      primary: '#F97316',
      secondary: '#FB923C',
      background: '#FFF7ED',
      surface: '#FFFFFF',
      text: '#7C2D12',
      textSecondary: '#78716C',
      border: '#FED7AA',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      cardBackground: '#FFEDD5',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#064E3B',
      textSecondary: '#6B7280',
      border: '#BBF7D0',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      cardBackground: '#D1FAE5',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    colors: {
      primary: '#A855F7',
      secondary: '#C084FC',
      background: '#FAF5FF',
      surface: '#FFFFFF',
      text: '#581C87',
      textSecondary: '#71717A',
      border: '#E9D5FF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      cardBackground: '#F3E8FF',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      background: '#EFF6FF',
      surface: '#FFFFFF',
      text: '#1E3A8A',
      textSecondary: '#64748B',
      border: '#BFDBFE',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      cardBackground: '#DBEAFE',
    },
  },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@momentum_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(THEMES[0]);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId) {
        const savedTheme = THEMES.find(t => t.id === savedThemeId);
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (themeId: string) => {
    const newTheme = THEMES.find(t => t.id === themeId);
    if (newTheme) {
      setThemeState(newTheme);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
