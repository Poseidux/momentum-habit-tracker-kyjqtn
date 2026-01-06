
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { authenticatedGet, authenticatedPost, isBackendConfigured } from '@/utils/api';

const THEME_STORAGE_KEY = '@momentum_theme';

export interface AppTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
}

export const THEMES: AppTheme[] = [
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    primary: '#0EA5E9',
    secondary: '#06B6D4',
    background: '#F0F9FF',
    surface: '#FFFFFF',
    text: '#0C4A6E',
    textSecondary: '#64748B',
    accent: '#38BDF8'
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    primary: '#F97316',
    secondary: '#FB923C',
    background: '#FFF7ED',
    surface: '#FFFFFF',
    text: '#7C2D12',
    textSecondary: '#78350F',
    accent: '#FDBA74'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    primary: '#10B981',
    secondary: '#34D399',
    background: '#F0FDF4',
    surface: '#FFFFFF',
    text: '#064E3B',
    textSecondary: '#065F46',
    accent: '#6EE7B7'
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    primary: '#A78BFA',
    secondary: '#C4B5FD',
    background: '#FAF5FF',
    surface: '#FFFFFF',
    text: '#5B21B6',
    textSecondary: '#7C3AED',
    accent: '#DDD6FE'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primary: '#3B82F6',
    secondary: '#60A5FA',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    accent: '#93C5FD'
  }
];

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (themeId: string) => Promise<void>;
  themes: AppTheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(THEMES[0]);
  const { user } = useAuth();

  useEffect(() => {
    loadTheme();
  }, [user]);

  const loadTheme = async () => {
    try {
      if (user && isBackendConfigured()) {
        const data = await authenticatedGet('/api/themes/active');
        if (data?.themeId) {
          const found = THEMES.find(t => t.id === data.themeId);
          if (found) setThemeState(found);
        }
      } else {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored) {
          const found = THEMES.find(t => t.id === stored);
          if (found) setThemeState(found);
        }
      }
    } catch (error) {
      console.error('[ThemeContext] Error loading theme:', error);
    }
  };

  const setTheme = async (themeId: string) => {
    try {
      const found = THEMES.find(t => t.id === themeId);
      if (!found) return;

      setThemeState(found);

      if (user && isBackendConfigured()) {
        await authenticatedPost('/api/themes/activate', { themeId });
      } else {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
      }
    } catch (error) {
      console.error('[ThemeContext] Error setting theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
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
