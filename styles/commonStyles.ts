
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Zen Minimal + Premium Calm Design System
// Neutral palette with warm grays/cream + single accent color

export const colors = {
  // Light Mode - Warm Neutrals
  light: {
    // Backgrounds
    background: '#FAFAF9',        // Warm off-white
    surface: '#FFFFFF',           // Pure white cards
    surfaceElevated: '#FFFFFF',   // Elevated surfaces
    
    // Text
    text: '#1C1917',              // Deep warm gray
    textSecondary: '#78716C',     // Medium warm gray
    textTertiary: '#A8A29E',      // Light warm gray
    
    // Accent - Used sparingly for progress + primary actions
    accent: '#6366F1',            // Calm indigo
    accentLight: '#818CF8',       // Lighter accent
    accentDark: '#4F46E5',        // Darker accent
    
    // Semantic
    success: '#10B981',           // Calm green
    warning: '#F59E0B',           // Warm amber
    error: '#EF4444',             // Soft red
    
    // Borders & Dividers
    border: '#E7E5E4',            // Hairline warm gray
    divider: '#F5F5F4',           // Subtle divider
    
    // Progress & Completion
    progressBg: '#F5F5F4',        // Light neutral
    progressFill: '#6366F1',      // Accent color
  },
  
  // Dark Mode - Deep Neutrals
  dark: {
    // Backgrounds
    background: '#0C0A09',        // Deep warm black
    surface: '#1C1917',           // Dark warm gray
    surfaceElevated: '#292524',   // Elevated dark surface
    
    // Text
    text: '#FAFAF9',              // Warm white
    textSecondary: '#A8A29E',     // Medium warm gray
    textTertiary: '#78716C',      // Darker warm gray
    
    // Accent - Same as light mode for consistency
    accent: '#818CF8',            // Slightly lighter for dark mode
    accentLight: '#A5B4FC',       // Lighter accent
    accentDark: '#6366F1',        // Darker accent
    
    // Semantic
    success: '#34D399',           // Brighter green for dark
    warning: '#FBBF24',           // Brighter amber for dark
    error: '#F87171',             // Softer red for dark
    
    // Borders & Dividers
    border: '#292524',            // Subtle border
    divider: '#1C1917',           // Subtle divider
    
    // Progress & Completion
    progressBg: '#292524',        // Dark neutral
    progressFill: '#818CF8',      // Accent color
  },
};

// 8pt spacing grid
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography scale - Modern sans with clear hierarchy
export const typography = {
  // Display - Hero headers
  display: {
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  
  // Title - Screen titles
  title: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  
  // Section - Section headers
  section: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  
  // Label - Form labels, card titles
  label: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  // Body - Regular text
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  
  // Caption - Small text, metadata
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0,
  },
  
  // Micro - Tiny labels
  micro: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
};

// Soft shadows for subtle depth
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
};

// Border radius - Rounded cards
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Common component styles
export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
  },
  
  // Cards with subtle depth
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  
  // Large touch targets (minimum 44x44)
  touchTarget: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Buttons
  primaryButton: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  secondaryButton: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
  },
  
  // Input fields
  input: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    borderWidth: 1,
    ...typography.body,
  },
  
  // Spacing utilities
  mb_xs: { marginBottom: spacing.xs },
  mb_sm: { marginBottom: spacing.sm },
  mb_md: { marginBottom: spacing.md },
  mb_lg: { marginBottom: spacing.lg },
  mb_xl: { marginBottom: spacing.xl },
  
  mt_xs: { marginTop: spacing.xs },
  mt_sm: { marginTop: spacing.sm },
  mt_md: { marginTop: spacing.md },
  mt_lg: { marginTop: spacing.lg },
  mt_xl: { marginTop: spacing.xl },
  
  // Layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Helper function to get theme colors based on color scheme
export const getThemeColors = (isDark: boolean) => {
  return isDark ? colors.dark : colors.light;
};
