
import { useAppTheme } from '@/contexts/ThemeContext';
import { View, Text, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { useHabits, useUserStats, useTodayCheckIns } from '@/hooks/useHabits';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState, useEffect } from 'react';

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
  const { currentTheme } = useAppTheme();
  const stats = useUserStats();

  useEffect(() => {
    setHeatmapData(generateHeatmapData(habits));
  }, [habits]);

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return currentTheme.colors.surface;
    const colors = [
      currentTheme.colors.primary + '30',
      currentTheme.colors.primary + '50',
      currentTheme.colors.primary + '70',
      currentTheme.colors.primary + '90',
      currentTheme.colors.primary,
    ];
    return colors[Math.min(intensity - 1, 4)];
  };

  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.streak && h.streak > 0).length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} edges={['top']}>
      <LinearGradient
        colors={currentTheme.colors.gradient || [currentTheme.colors.primary, currentTheme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Progress</Text>
        <Text style={styles.headerSubtitle}>Track your journey</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Animated.View entering={FadeInDown.delay(100)} style={[styles.statCard, { backgroundColor: currentTheme.colors.surface }]}>
            <LinearGradient
              colors={[currentTheme.colors.primary + '30', currentTheme.colors.primary + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statIconContainer}
            >
              <IconSymbol ios_icon_name="flame.fill" android_material_icon_name="local-fire-department" size={28} color={currentTheme.colors.primary} />
            </LinearGradient>
            <Text style={[styles.statValue, { color: currentTheme.colors.text }]}>{stats.level}</Text>
            <Text style={[styles.statLabel, { color: currentTheme.colors.textSecondary }]}>Level</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={[styles.statCard, { backgroundColor: currentTheme.colors.surface }]}>
            <LinearGradient
              colors={[currentTheme.colors.secondary + '30', currentTheme.colors.secondary + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statIconContainer}
            >
              <IconSymbol ios_icon_name="star.fill" android_material_icon_name="star" size={28} color={currentTheme.colors.secondary} />
            </LinearGradient>
            <Text style={[styles.statValue, { color: currentTheme.colors.text }]}>{stats.xp}</Text>
            <Text style={[styles.statLabel, { color: currentTheme.colors.textSecondary }]}>XP</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={[styles.statCard, { backgroundColor: currentTheme.colors.surface }]}>
            <LinearGradient
              colors={[currentTheme.colors.success + '30', currentTheme.colors.success + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statIconContainer}
            >
              <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check-circle" size={28} color={currentTheme.colors.success} />
            </LinearGradient>
            <Text style={[styles.statValue, { color: currentTheme.colors.text }]}>{completionRate}%</Text>
            <Text style={[styles.statLabel, { color: currentTheme.colors.textSecondary }]}>Today</Text>
          </Animated.View>
        </View>

        {/* Activity Heatmap */}
        <Animated.View entering={FadeInDown.delay(400)} style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: currentTheme.colors.text }]}>Activity</Text>
          <Text style={[styles.cardSubtitle, { color: currentTheme.colors.textSecondary }]}>Last 90 days</Text>
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
              <Text style={[styles.legendText, { color: currentTheme.colors.textSecondary }]}>Less</Text>
              {[0, 1, 2, 3, 4].map((intensity, index) => (
                <View
                  key={`legend-${index}`}
                  style={[
                    styles.legendCell,
                    { backgroundColor: getHeatmapColor(intensity) }
                  ]}
                />
              ))}
              <Text style={[styles.legendText, { color: currentTheme.colors.textSecondary }]}>More</Text>
            </View>
          </View>
        </Animated.View>

        {/* Habits List */}
        <Animated.View entering={FadeInDown.delay(500)} style={[styles.card, { backgroundColor: currentTheme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: currentTheme.colors.text }]}>Your Habits</Text>
          {habits.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol ios_icon_name="tray" android_material_icon_name="inbox" size={48} color={currentTheme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: currentTheme.colors.textSecondary }]}>No habits yet</Text>
            </View>
          ) : (
            habits.map((habit, index) => (
              <React.Fragment key={`habit-${index}`}>
                <View style={styles.habitItem}>
                  <View style={styles.habitLeft}>
                    <View style={[styles.habitIconContainer, { backgroundColor: habit.color + '20' }]}>
                      <IconSymbol
                        ios_icon_name={habit.icon || 'checkmark.circle'}
                        android_material_icon_name="check-circle"
                        size={20}
                        color={habit.color}
                      />
                    </View>
                    <View style={styles.habitInfo}>
                      <Text style={[styles.habitTitle, { color: currentTheme.colors.text }]}>{habit.title}</Text>
                      {habit.streak && habit.streak > 0 && (
                        <View style={styles.streakBadge}>
                          <IconSymbol ios_icon_name="flame.fill" android_material_icon_name="local-fire-department" size={12} color="#F59E0B" />
                          <Text style={styles.streakText}>{habit.streak} day streak</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.habitStats}>
                    <Text style={[styles.habitStatValue, { color: currentTheme.colors.text }]}>
                      {habit.totalCheckIns || 0}
                    </Text>
                    <Text style={[styles.habitStatLabel, { color: currentTheme.colors.textSecondary }]}>
                      check-ins
                    </Text>
                  </View>
                </View>
                {index < habits.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: currentTheme.colors.background }]} />
                )}
              </React.Fragment>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  heatmapContainer: {
    gap: 12,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  heatmapCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 11,
  },
  legendCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  habitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '500',
  },
  habitStats: {
    alignItems: 'flex-end',
  },
  habitStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitStatLabel: {
    fontSize: 11,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
});
