
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Momentum color palette - vibrant and motivating
export const colors = {
  primary: '#6366F1',      // Indigo - main brand color
  primaryDark: '#4F46E5',  // Darker indigo for pressed states
  secondary: '#8B5CF6',    // Purple - secondary actions
  accent: '#EC4899',       // Pink - highlights and celebrations
  success: '#10B981',      // Green - completed habits
  warning: '#F59E0B',      // Amber - warnings
  danger: '#EF4444',       // Red - delete actions
  
  // Backgrounds
  background: '#F8FAFC',
  backgroundDark: '#0F172A',
  backgroundAlt: '#FFFFFF',
  backgroundAltDark: '#1E293B',
  
  // Cards
  card: '#FFFFFF',
  cardDark: '#1E293B',
  cardBorder: '#E2E8F0',
  cardBorderDark: '#334155',
  
  // Text
  text: '#1E293B',
  textDark: '#F1F5F9',
  textSecondary: '#64748B',
  textSecondaryDark: '#94A3B8',
  
  // UI Elements
  border: '#E2E8F0',
  borderDark: '#334155',
  divider: '#F1F5F9',
  dividerDark: '#334155',
  surface: '#F1F5F9',
  
  // Habit strength colors
  strengthWeak: '#EF4444',
  strengthMedium: '#F59E0B',
  strengthStrong: '#10B981',
  
  // XP and gamification
  xpGold: '#FBBF24',
  levelBadge: '#8B5CF6',
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.danger,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
