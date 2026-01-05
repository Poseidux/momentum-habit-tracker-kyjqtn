
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

interface XPBarProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export default function XPBar({ level, xp, xpToNextLevel }: XPBarProps) {
  const theme = useTheme();
  const progress = (xp / xpToNextLevel) * 100;

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: theme.dark ? colors.cardDark : colors.card,
        borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LVL {level}</Text>
        </View>
        <Text style={[styles.xpText, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
          {xp} / {xpToNextLevel} XP
        </Text>
      </View>
      
      <View style={styles.progressBar}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: colors.levelBadge,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
});
