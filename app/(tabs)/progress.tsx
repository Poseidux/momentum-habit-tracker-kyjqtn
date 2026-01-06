
import { useAppTheme } from '@/contexts/ThemeContext';
import React, { useState, useEffect } from 'react';
import { spacing, typography, borderRadius, shadows } from '@/styles/commonStyles';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useHabits, useUserStats } from '@/hooks/useHabits';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

const CELL_SIZE = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xxs,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    marginBottom: spacing.md,
  },
  heatmapContainer: {
    marginTop: spacing.md,
  },
  heatmapRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  heatmapCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
    marginRight: 4,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  legendText: {
    fontSize: typography.sizes.xs,
    marginRight: spacing.xs,
  },
});

function generateHeatmapData(habits: any[]) {
  const weeks = 12;
  const data: number[][] = [];
  
  for (let week = 0; week < weeks; week++) {
    const weekData: number[] = [];
    for (let day = 0; day < 7; day++) {
      weekData.push(Math.floor(Math.random() * 5));
    }
    data.push(weekData);
  }
  
  return data;
}

export default function ProgressScreen() {
  const { currentTheme } = useAppTheme();
  const { stats } = useUserStats();
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const { habits } = useHabits();

  useEffect(() => {
    setHeatmapData(generateHeatmapData(habits));
  }, [habits]);

  const getHeatmapColor = (intensity: number) => {
    const colors = [
      currentTheme.colors.border,
      `${currentTheme.colors.primary}40`,
      `${currentTheme.colors.primary}60`,
      `${currentTheme.colors.primary}80`,
      currentTheme.colors.primary,
    ];
    return colors[intensity] || colors[0];
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.colors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.colors.text }]}>
            Progress
          </Text>
          <Text style={[styles.subtitle, { color: currentTheme.colors.textSecondary }]}>
            Track your journey
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200)}
          style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <IconSymbol
                ios_icon_name="flame.fill"
                android_material_icon_name="local-fire-department"
                size={24}
                color={currentTheme.colors.primary}
              />
              <Text style={[styles.statValue, { color: currentTheme.colors.text }]}>
                {stats.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: currentTheme.colors.textSecondary }]}>
                Day Streak
              </Text>
            </View>

            <View style={styles.statItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color={currentTheme.colors.success}
              />
              <Text style={[styles.statValue, { color: currentTheme.colors.text }]}>
                {stats.totalCheckIns}
              </Text>
              <Text style={[styles.statLabel, { color: currentTheme.colors.textSecondary }]}>
                Total Check-ins
              </Text>
            </View>

            <View style={styles.statItem}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={24}
                color={currentTheme.colors.warning}
              />
              <Text style={[styles.statValue, { color: currentTheme.colors.text }]}>
                {stats.level}
              </Text>
              <Text style={[styles.statLabel, { color: currentTheme.colors.textSecondary }]}>
                Level
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300)}
          style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            Activity Heatmap
          </Text>
          <View style={styles.heatmapContainer}>
            {heatmapData.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.heatmapRow}>
                {week.map((intensity, dayIndex) => (
                  <View
                    key={`day-${weekIndex}-${dayIndex}`}
                    style={[
                      styles.heatmapCell,
                      { backgroundColor: getHeatmapColor(intensity) },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
          <View style={styles.heatmapLegend}>
            <Text style={[styles.legendText, { color: currentTheme.colors.textSecondary }]}>
              Less
            </Text>
            {[0, 1, 2, 3, 4].map((intensity) => (
              <View
                key={`legend-${intensity}`}
                style={[
                  styles.heatmapCell,
                  { backgroundColor: getHeatmapColor(intensity) },
                ]}
              />
            ))}
            <Text style={[styles.legendText, { color: currentTheme.colors.textSecondary }]}>
              More
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
