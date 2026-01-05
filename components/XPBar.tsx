
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import Animated, { FadeIn } from 'react-native-reanimated';

interface XPBarProps {
  xp: number;
  level: number;
  xpToNextLevel?: number;
}

export default function XPBar({ xp, level, xpToNextLevel = 100 }: XPBarProps) {
  const theme = useTheme();
  const progress = Math.min((xp / xpToNextLevel) * 100, 100);

  return (
    <Animated.View 
      entering={FadeIn}
      style={[
        styles.container,
        { 
          backgroundColor: theme.dark ? colors.cardDark : colors.card,
          borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
        }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv {level}</Text>
        </View>
        <Text style={[styles.xpText, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
          {xp} / {xpToNextLevel} XP
        </Text>
      </View>
      <View style={[styles.progressBarContainer, { backgroundColor: theme.dark ? '#2D2D2D' : '#EEEEEE' }]}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${progress}%`,
              backgroundColor: colors.xpGold,
            }
          ]} 
        />
      </View>
    </Animated.View>
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
    backgroundColor: colors.xpGold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});
