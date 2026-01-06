
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { authenticatedGet, authenticatedPost, isBackendConfigured } from '@/utils/api';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    streakGold: string;
    streakSilver: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#4ECDC4',
      secondary: '#45B7D1',
      surface: '#1A1A2E',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      success: '#52B788',
      error: '#FF6B6B',
      streakGold: '#FFD700',
      streakSilver: '#C0C0C0',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FFA07A',
      surface: '#2D1B2E',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      success: '#52B788',
      error: '#FF4757',
      streakGold: '#FFD700',
      streakSilver: '#C0C0C0',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#52B788',
      secondary: '#95D5B2',
      surface: '#1B2A1F',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      success: '#74C69D',
      error: '#FF6B6B',
      streakGold: '#FFD700',
      streakSilver: '#C0C0C0',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    colors: {
      primary: '#BB8FCE',
      secondary: '#D7BDE2',
      surface: '#2A1E2E',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      success: '#52B788',
      error: '#FF6B6B',
      streakGold: '#FFD700',
      streakSilver: '#C0C0C0',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      primary: '#85C1E2',
      secondary: '#5DADE2',
      surface: '#0F1419',
      text: '#FFFFFF',
      textSecondary: '#8899A6',
      success: '#52B788',
      error: '#FF6B6B',
      streakGold: '#FFD700',
      streakSilver: '#C0C0C0',
    },
  },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES[0],
  setTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = '@momentum_theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(THEMES[0]);
  const { user } = useAuth();

  useEffect(() => {
    loadTheme();
  }, [user]);

  const loadTheme = async () => {
    try {
      if (user && isBackendConfigured()) {
        const response = await authenticatedGet('/api/themes/current');
        if (response.theme) {
          const savedTheme = THEMES.find(t => t.id === response.theme.themeId);
          if (savedTheme) {
            setThemeState(savedTheme);
            return;
          }
        }
      }
      
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

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme.id);
      
      if (user && isBackendConfigured()) {
        await authenticatedPost('/api/themes/set', { themeId: newTheme.id });
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
