
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useHabits, useUserStats } from '@/hooks/useHabits';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { spacing, typography, borderRadius, shadows } from '@/styles/commonStyles';

const CELL_SIZE = 12;

const generateHeatmapData = (habits: any[]) => {
  const data: { [key: string]: number } = {};
  const today = new Date();
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    data[dateStr] = Math.floor(Math.random() * 5);
  }
  
  return data;
};

export default function ProgressScreen() {
  const { habits } = useHabits();
  const [heatmapData, setHeatmapData] = useState<{ [key: string]: number }>({});
  const { isDark, colors } = useAppTheme();
  const stats = useUserStats();

  useEffect(() => {
    setHeatmapData(generateHeatmapData(habits));
  }, [habits]);

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return colors.progressBg;
    const opacities = ['20', '40', '60', '80', 'FF'];
    return colors.accent + opacities[Math.min(intensity - 1, 4)];
  };

  const totalHabits = habits.length;
  const activeHabits = habits.filter(h => h.currentStreak > 0).length;
  const totalCheckIns = habits.reduce((sum, h) => sum + (h.totalCheckIns || 0), 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Progress</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your journey at a glance</Text>
        </View>

        {/* Weekly Summary Cards */}
        <View style={styles.statsGrid}>
          <Animated.View entering={FadeInDown.delay(100)} style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.accent + '20' }]}>
              <IconSymbol ios_icon_name="chart.bar.fill" android_material_icon_name="bar-chart" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalHabits}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Habits</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150)} style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
              <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check-circle" size={24} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{activeHabits}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Streaks</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
              <IconSymbol ios_icon_name="star.fill" android_material_icon_name="star" size={24} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalCheckIns}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Check-ins</Text>
          </Animated.View>
        </View>

        {/* Heatmap */}
        <Animated.View entering={FadeInDown.delay(250)} style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Activity</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Last 90 days</Text>
          
          <View style={styles.heatmapContainer}>
            <View style={styles.heatmapGrid}>
              {Object.entries(heatmapData).slice(0, 84).map(([date, intensity], index) => (
                <View
                  key={`heatmap-${index}`}
                  style={[
                    styles.heatmapCell,
                    { backgroundColor: getHeatmapColor(intensity) }
                  ]}
                />
              ))}
            </View>
            
            <View style={styles.heatmapLegend}>
              <Text style={[styles.legendText, { color: colors.textTertiary }]}>Less</Text>
              {[0, 1, 2, 3, 4].map((intensity, index) => (
                <React.Fragment key={`legend-${index}`}>
                  <View
                    style={[
                      styles.legendCell,
                      { backgroundColor: getHeatmapColor(intensity) }
                    ]}
                  />
                </React.Fragment>
              ))}
              <Text style={[styles.legendText, { color: colors.textTertiary }]}>More</Text>
            </View>
          </View>
        </Animated.View>

        {/* Habits List */}
        <Animated.View entering={FadeInDown.delay(300)} style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Your Habits</Text>
          
          {habits.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol ios_icon_name="tray" android_material_icon_name="inbox" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No habits yet</Text>
            </View>
          ) : (
            habits.map((habit, index) => (
              <React.Fragment key={`habit-${index}`}>
                <View style={styles.habitItem}>
                  <View style={styles.habitLeft}>
                    <View style={[styles.habitIconContainer, { backgroundColor: colors.accent + '20' }]}>
                      <IconSymbol
                        ios_icon_name={habit.icon || 'checkmark.circle'}
                        android_material_icon_name="check-circle"
                        size={20}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.habitInfo}>
                      <Text style={[styles.habitTitle, { color: colors.text }]}>{habit.name}</Text>
                      {habit.currentStreak > 0 && (
                        <View style={styles.streakBadge}>
                          <IconSymbol ios_icon_name="flame.fill" android_material_icon_name="local-fire-department" size={12} color={colors.warning} />
                          <Text style={[styles.streakText, { color: colors.textSecondary }]}>{habit.currentStreak} day streak</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.habitStats}>
                    <Text style={[styles.habitStatValue, { color: colors.text }]}>
                      {habit.totalCheckIns || 0}
                    </Text>
                    <Text style={[styles.habitStatLabel, { color: colors.textSecondary }]}>
                      check-ins
                    </Text>
                  </View>
                </View>
                {index < habits.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </React.Fragment>
            ))
          )}
        </Animated.View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  
  // Header
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.section,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
  },
  
  // Card
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardTitle: {
    ...typography.section,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  
  // Heatmap
  heatmapContainer: {
    gap: spacing.md,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  heatmapCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendText: {
    ...typography.micro,
  },
  legendCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.body,
  },
  
  // Habit Item
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  habitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakText: {
    ...typography.caption,
  },
  habitStats: {
    alignItems: 'flex-end',
  },
  habitStatValue: {
    ...typography.label,
    fontWeight: '600',
  },
  habitStatLabel: {
    ...typography.micro,
  },
  divider: {
    height: 1,
  },
});
