
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticatedGet, authenticatedPost, isBackendConfigured } from '@/utils/api';

export interface ThemeColors {
  id: string;
  name: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  success: string;
  background: string;
  backgroundDark: string;
  card: string;
  cardDark: string;
  text: string;
  textDark: string;
  textSecondary: string;
  textSecondaryDark: string;
}

export const THEMES: ThemeColors[] = [
  {
    id: 'default',
    name: 'Ocean Breeze',
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    secondary: '#8B5CF6',
    accent: '#EC4899',
    success: '#10B981',
    background: '#F8FAFC',
    backgroundDark: '#0F172A',
    card: '#FFFFFF',
    cardDark: '#1E293B',
    text: '#1E293B',
    textDark: '#F1F5F9',
    textSecondary: '#64748B',
    textSecondaryDark: '#94A3B8',
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    primary: '#F97316',
    primaryDark: '#EA580C',
    secondary: '#FB923C',
    accent: '#FBBF24',
    success: '#10B981',
    background: '#FFF7ED',
    backgroundDark: '#1C1917',
    card: '#FFFFFF',
    cardDark: '#292524',
    text: '#1C1917',
    textDark: '#FEF3C7',
    textSecondary: '#78716C',
    textSecondaryDark: '#A8A29E',
  },
  {
    id: 'forest',
    name: 'Forest Green',
    primary: '#059669',
    primaryDark: '#047857',
    secondary: '#10B981',
    accent: '#34D399',
    success: '#22C55E',
    background: '#F0FDF4',
    backgroundDark: '#14532D',
    card: '#FFFFFF',
    cardDark: '#166534',
    text: '#14532D',
    textDark: '#D1FAE5',
    textSecondary: '#6B7280',
    textSecondaryDark: '#9CA3AF',
  },
  {
    id: 'lavender',
    name: 'Lavender Dreams',
    primary: '#A855F7',
    primaryDark: '#9333EA',
    secondary: '#C084FC',
    accent: '#E879F9',
    success: '#10B981',
    background: '#FAF5FF',
    backgroundDark: '#3B0764',
    card: '#FFFFFF',
    cardDark: '#581C87',
    text: '#3B0764',
    textDark: '#F3E8FF',
    textSecondary: '#6B7280',
    textSecondaryDark: '#C4B5FD',
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    secondary: '#60A5FA',
    accent: '#38BDF8',
    success: '#10B981',
    background: '#EFF6FF',
    backgroundDark: '#0C4A6E',
    card: '#FFFFFF',
    cardDark: '#075985',
    text: '#0C4A6E',
    textDark: '#DBEAFE',
    textSecondary: '#64748B',
    textSecondaryDark: '#BAE6FD',
  },
];

interface ThemeContextType {
  currentTheme: ThemeColors;
  setTheme: (themeId: string) => void;
  themes: ThemeColors[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@momentum_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(THEMES[0]);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      // Try to load from backend first (if configured and user is authenticated)
      if (isBackendConfigured()) {
        try {
          console.log('[Theme] Fetching active theme from backend...');
          const response = await authenticatedGet<any>('/api/themes/active');
          console.log('[Theme] Active theme response:', response);
          
          if (response?.themeId) {
            const theme = THEMES.find(t => t.id === response.themeId);
            if (theme) {
              console.log('[Theme] Loaded theme from backend:', theme.name);
              setCurrentTheme(theme);
              await AsyncStorage.setItem(THEME_STORAGE_KEY, theme.id);
              return;
            }
          }
        } catch (error: any) {
          console.log('[Theme] Could not load theme from backend (using local):', error.message);
        }
      }

      // Fall back to local storage
      const savedThemeId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId) {
        const theme = THEMES.find(t => t.id === savedThemeId);
        if (theme) {
          console.log('[Theme] Loaded theme from local storage:', theme.name);
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error('[Theme] Failed to load theme:', error);
    }
  };

  const setTheme = async (themeId: string) => {
    try {
      const theme = THEMES.find(t => t.id === themeId);
      if (theme) {
        setCurrentTheme(theme);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
        
        // Sync to backend if configured
        if (isBackendConfigured()) {
          try {
            console.log('[Theme] Activating theme on backend:', themeId);
            await authenticatedPost('/api/themes/activate', { themeId });
            console.log('[Theme] Theme synced to backend');
          } catch (error: any) {
            console.log('[Theme] Could not sync theme to backend:', error.message);
          }
        }
      }
    } catch (error) {
      console.error('[Theme] Failed to save theme:', error);
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
  if (context === undefined) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
}
