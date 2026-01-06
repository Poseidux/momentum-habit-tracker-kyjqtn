
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
  };
}

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Ocean Blue',
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      background: '#000000',
      surface: '#1C1C1E',
      text: '#FFFFFF',
      textSecondary: '#98989D',
      border: '#38383A',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FFB347',
      background: '#1A0E0E',
      surface: '#2D1B1B',
      text: '#FFFFFF',
      textSecondary: '#B89898',
      border: '#4A3333',
      success: '#6BCF7F',
      warning: '#FFB347',
      error: '#FF4757',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    colors: {
      primary: '#2ECC71',
      secondary: '#27AE60',
      background: '#0A1612',
      surface: '#1A2C24',
      text: '#FFFFFF',
      textSecondary: '#98B8A8',
      border: '#2D4A3A',
      success: '#2ECC71',
      warning: '#F39C12',
      error: '#E74C3C',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    colors: {
      primary: '#9B59B6',
      secondary: '#8E44AD',
      background: '#14101A',
      surface: '#241C2D',
      text: '#FFFFFF',
      textSecondary: '#B098C8',
      border: '#3A2D4A',
      success: '#1ABC9C',
      warning: '#F39C12',
      error: '#E74C3C',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: {
      primary: '#3498DB',
      secondary: '#2980B9',
      background: '#0C1218',
      surface: '#1C2A36',
      text: '#FFFFFF',
      textSecondary: '#98A8B8',
      border: '#2D3A4A',
      success: '#16A085',
      warning: '#F39C12',
      error: '#C0392B',
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@momentum_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId) {
        const theme = THEMES.find(t => t.id === savedThemeId);
        if (theme) {
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (themeId: string) => {
    try {
      const theme = THEMES.find(t => t.id === themeId);
      if (theme) {
        setCurrentTheme(theme);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
}
