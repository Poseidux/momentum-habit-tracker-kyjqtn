
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useHabits, useUserStats, useTodayCheckIns } from '@/hooks/useHabits';
import { useAppTheme } from '@/contexts/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { authenticatedGet, isBackendConfigured } from '@/utils/api';

const CELL_SIZE = (Dimensions.get('window').width - 80) / 7;

export default function ProgressScreen() {
  const { currentTheme } = useAppTheme();
  const { habits } = useHabits();
  const { stats } = useUserStats();
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  useEffect(() => {
    // Generate heatmap data for the last 12 weeks
    const weeks = [];
    const today = new Date();
    
    for (let week = 11; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7 + (6 - day)));
        
        // Random intensity for demo (0-4)
        const intensity = Math.floor(Math.random() * 5);
        
        weekData.push({
          date: date.toISOString().split('T')[0],
          intensity,
        });
      }
      weeks.push(weekData);
    }
    
    setHeatmapData(weeks);
  }, [habits]);

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return currentTheme.card;
    const colors = [
      currentTheme.primary + '20',
      currentTheme.primary + '40',
      currentTheme.primary + '60',
      currentTheme.primary + '80',
      currentTheme.primary,
    ];
    return colors[intensity - 1] || currentTheme.card;
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: currentTheme.background }]} 
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Progress</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Animated.View 
            entering={FadeInDown.duration(500)}
            style={[styles.statCard, { backgroundColor: currentTheme.card }]}
          >
            <IconSymbol 
              ios_icon_name="flame" 
              android_material_icon_name="local-fire-department" 
              size={32} 
              color={currentTheme.accent} 
            />
            <Text style={[styles.statValue, { color: currentTheme.text }]}>
              {stats.currentStreak || 0}
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>
              Day Streak
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(100).duration(500)}
            style={[styles.statCard, { backgroundColor: currentTheme.card }]}
          >
            <IconSymbol 
              ios_icon_name="checkmark.circle" 
              android_material_icon_name="check-circle" 
              size={32} 
              color={currentTheme.success} 
            />
            <Text style={[styles.statValue, { color: currentTheme.text }]}>
              {stats.totalCheckIns || 0}
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>
              Total Check-ins
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(200).duration(500)}
            style={[styles.statCard, { backgroundColor: currentTheme.card }]}
          >
            <IconSymbol 
              ios_icon_name="chart.bar" 
              android_material_icon_name="bar-chart" 
              size={32} 
              color={currentTheme.primary} 
            />
            <Text style={[styles.statValue, { color: currentTheme.text }]}>
              {stats.consistency || 0}%
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>
              Consistency
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(300).duration(500)}
            style={[styles.statCard, { backgroundColor: currentTheme.card }]}
          >
            <IconSymbol 
              ios_icon_name="target" 
              android_material_icon_name="track-changes" 
              size={32} 
              color={currentTheme.secondary} 
            />
            <Text style={[styles.statValue, { color: currentTheme.text }]}>
              {stats.activeHabits || 0}
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.textSecondary }]}>
              Active Habits
            </Text>
          </Animated.View>
        </View>

        {/* Calendar Heatmap */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(500)}
          style={[styles.section, { backgroundColor: currentTheme.card }]}
        >
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Activity Calendar
          </Text>
          <Text style={[styles.sectionSubtitle, { color: currentTheme.textSecondary }]}>
            Last 12 weeks
          </Text>

          <View style={styles.heatmapContainer}>
            {/* Day labels */}
            <View style={styles.dayLabels}>
              {weekDays.map((day, index) => (
                <Text 
                  key={index} 
                  style={[
                    styles.dayLabel, 
                    { color: currentTheme.textSecondary, width: CELL_SIZE }
                  ]}
                >
                  {day}
                </Text>
              ))}
            </View>

            {/* Heatmap grid */}
            <View style={styles.heatmapGrid}>
              {heatmapData.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.weekColumn}>
                  {week.map((day: any, dayIndex: number) => (
                    <View
                      key={dayIndex}
                      style={[
                        styles.heatmapCell,
                        {
                          backgroundColor: getHeatmapColor(day.intensity),
                          width: CELL_SIZE - 4,
                          height: CELL_SIZE - 4,
                        },
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <Text style={[styles.legendText, { color: currentTheme.textSecondary }]}>
                Less
              </Text>
              {[0, 1, 2, 3, 4].map((intensity) => (
                <View
                  key={intensity}
                  style={[
                    styles.legendCell,
                    { backgroundColor: getHeatmapColor(intensity) },
                  ]}
                />
              ))}
              <Text style={[styles.legendText, { color: currentTheme.textSecondary }]}>
                More
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Insights */}
        <Animated.View 
          entering={FadeInDown.delay(500).duration(500)}
          style={[styles.section, { backgroundColor: currentTheme.card }]}
        >
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Insights
          </Text>
          
          <View style={styles.insightItem}>
            <IconSymbol 
              ios_icon_name="lightbulb" 
              android_material_icon_name="lightbulb" 
              size={20} 
              color={currentTheme.accent} 
            />
            <Text style={[styles.insightText, { color: currentTheme.text }]}>
              You&apos;re most consistent on Tuesdays and Thursdays
            </Text>
          </View>

          <View style={styles.insightItem}>
            <IconSymbol 
              ios_icon_name="trophy" 
              android_material_icon_name="emoji-events" 
              size={20} 
              color={currentTheme.accent} 
            />
            <Text style={[styles.insightText, { color: currentTheme.text }]}>
              Your longest streak is {stats.currentStreak || 0} days!
            </Text>
          </View>

          <View style={styles.insightItem}>
            <IconSymbol 
              ios_icon_name="chart.line.uptrend" 
              android_material_icon_name="trending-up" 
              size={20} 
              color={currentTheme.success} 
            />
            <Text style={[styles.insightText, { color: currentTheme.text }]}>
              You&apos;ve completed {stats.totalCheckIns || 0} habits this month
            </Text>
          </View>
        </Animated.View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  heatmapContainer: {
    marginTop: 8,
  },
  dayLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  heatmapGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  weekColumn: {
    gap: 4,
  },
  heatmapCell: {
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 16,
  },
  legendText: {
    fontSize: 11,
    marginHorizontal: 4,
  },
  legendCell: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
});
