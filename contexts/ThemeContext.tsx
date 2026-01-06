
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticatedGet, authenticatedPost, isBackendConfigured } from '@/utils/api';
import { useAuth } from './AuthContext';

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
    success: string;
    warning: string;
    error: string;
    gradient: string[];
  };
}

export const PRESET_THEMES: Theme[] = [
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
      primary: '#06B6D4',
      secondary: '#0EA5E9',
      background: '#0C4A6E',
      surface: '#075985',
      text: '#F0F9FF',
      textSecondary: '#BAE6FD',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: ['#06B6D4', '#0EA5E9'],
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      background: '#064E3B',
      surface: '#065F46',
      text: '#ECFDF5',
      textSecondary: '#A7F3D0',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: ['#10B981', '#059669'],
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#F59E0B',
      secondary: '#EF4444',
      background: '#7C2D12',
      surface: '#9A3412',
      text: '#FFF7ED',
      textSecondary: '#FED7AA',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: ['#F59E0B', '#EF4444'],
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      background: '#1E1B4B',
      surface: '#312E81',
      text: '#F5F3FF',
      textSecondary: '#C4B5FD',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradient: ['#8B5CF6', '#A78BFA'],
    },
  },
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => Promise<void>;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(PRESET_THEMES[0]);
  const [themes, setThemes] = useState<Theme[]>(PRESET_THEMES);
  const { user } = useAuth();

  useEffect(() => {
    loadTheme();
  }, [user]);

  const loadTheme = async () => {
    try {
      if (user && isBackendConfigured()) {
        const response = await authenticatedGet('/api/themes/current');
        if (response.theme) {
          const theme = PRESET_THEMES.find(t => t.id === response.theme.themeId) || PRESET_THEMES[0];
          setCurrentTheme(theme);
        }
      } else {
        const savedThemeId = await AsyncStorage.getItem('theme');
        if (savedThemeId) {
          const theme = PRESET_THEMES.find(t => t.id === savedThemeId) || PRESET_THEMES[0];
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (themeId: string) => {
    const theme = PRESET_THEMES.find(t => t.id === themeId);
    if (!theme) return;

    setCurrentTheme(theme);

    try {
      if (user && isBackendConfigured()) {
        await authenticatedPost('/api/themes/set', { themeId });
      } else {
        await AsyncStorage.setItem('theme', themeId);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
