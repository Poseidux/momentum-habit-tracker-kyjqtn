
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useHabits, useUserStats, useTodayCheckIns } from '@/hooks/useHabits';
import { useAppTheme } from '@/contexts/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

const CELL_SIZE = 12;

export default function ProgressScreen() {
  const { currentTheme } = useAppTheme();
  const { habits } = useHabits();
  const { stats } = useUserStats();
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  // Provide fallback colors in case theme is not loaded
  const backgroundColor = currentTheme?.colors?.background || '#000000';
  const surfaceColor = currentTheme?.colors?.surface || '#1C1C1E';
  const textColor = currentTheme?.colors?.text || '#FFFFFF';
  const textSecondaryColor = currentTheme?.colors?.textSecondary || '#98989D';
  const primaryColor = currentTheme?.colors?.primary || '#007AFF';
  const successColor = currentTheme?.colors?.success || '#34C759';

  useEffect(() => {
    // Generate heatmap data from habits
    const data = generateHeatmapData(habits);
    setHeatmapData(data);
  }, [habits]);

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return surfaceColor;
    const alpha = Math.min(intensity / 5, 1);
    return `${primaryColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor }]} 
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>
          Progress
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
            <IconSymbol 
              ios_icon_name="flame.fill" 
              android_material_icon_name="local-fire-department" 
              size={32} 
              color={primaryColor} 
            />
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats?.currentStreak || 0}
            </Text>
            <Text style={[styles.statLabel, { color: textSecondaryColor }]}>
              Day Streak
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: surfaceColor }]}>
            <IconSymbol 
              ios_icon_name="checkmark.circle.fill" 
              android_material_icon_name="check-circle" 
              size={32} 
              color={successColor} 
            />
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats?.totalCheckIns || 0}
            </Text>
            <Text style={[styles.statLabel, { color: textSecondaryColor }]}>
              Total Check-ins
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Activity Heatmap
          </Text>
          <View style={[styles.heatmapContainer, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.heatmapPlaceholder, { color: textSecondaryColor }]}>
              Complete habits to see your activity
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Habit Performance
          </Text>
          {habits.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}>
              <IconSymbol 
                ios_icon_name="chart.bar" 
                android_material_icon_name="bar-chart" 
                size={48} 
                color={textSecondaryColor} 
              />
              <Text style={[styles.emptyText, { color: textSecondaryColor }]}>
                No habits yet. Start tracking to see your progress!
              </Text>
            </View>
          ) : (
            habits.map((habit, index) => (
              <Animated.View 
                key={habit.id} 
                entering={FadeInDown.delay(400 + index * 50)}
                style={[styles.habitCard, { backgroundColor: surfaceColor }]}
              >
                <View style={styles.habitHeader}>
                  <Text style={[styles.habitName, { color: textColor }]}>
                    {habit.name}
                  </Text>
                  <Text style={[styles.habitStrength, { color: primaryColor }]}>
                    {habit.strength || 0}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${habit.strength || 0}%`,
                        backgroundColor: primaryColor
                      }
                    ]} 
                  />
                </View>
              </Animated.View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function generateHeatmapData(habits: any[]) {
  // Placeholder for heatmap generation logic
  return [];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  heatmapContainer: {
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heatmapPlaceholder: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  habitCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
  },
  habitStrength: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
