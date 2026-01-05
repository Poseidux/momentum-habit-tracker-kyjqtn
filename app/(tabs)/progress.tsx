
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useHabits, useUserStats, useHabitCheckIns } from '@/hooks/useHabits';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 80) / 7;

export default function ProgressScreen() {
  const theme = useTheme();
  const { stats } = useUserStats();
  const { habits } = useHabits();

  // Calculate insights
  const insights = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostConsistentDay = dayNames[2]; // Mock: Tuesday
    const weeklyTrend: 'improving' | 'stable' | 'declining' = 'improving';
    const onTrackPercentage = stats.consistency || 75;

    return {
      mostConsistentDay,
      weeklyTrend,
      onTrackPercentage,
      weeklyReview: `You're most consistent on ${mostConsistentDay}. Keep up the great work!`,
    };
  }, [stats]);

  // Generate calendar heatmap data (last 30 days)
  const heatmapData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Mock intensity (0-4) - TODO: Backend Integration - Fetch actual check-in data
      const intensity = Math.floor(Math.random() * 5);
      
      data.push({
        date: date.toISOString().split('T')[0],
        intensity,
        day: date.getDate(),
        dayOfWeek: date.getDay(),
      });
    }
    
    return data;
  }, []);

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return theme.dark ? '#2D2D2D' : '#EEEEEE';
    if (intensity === 1) return theme.dark ? '#0E4429' : '#9BE9A8';
    if (intensity === 2) return theme.dark ? '#006D32' : '#40C463';
    if (intensity === 3) return theme.dark ? '#26A641' : '#30A14E';
    return theme.dark ? '#39D353' : '#216E39';
  };

  const statCards = [
    {
      icon: 'local-fire-department',
      label: 'Current Streak',
      value: stats.currentStreak || stats.currentWeekStreak || 0,
      unit: 'days',
      color: colors.accent,
    },
    {
      icon: 'star',
      label: 'Total XP',
      value: stats.xp || 0,
      unit: 'XP',
      color: colors.xpGold,
    },
    {
      icon: 'check-circle',
      label: 'Total Check-ins',
      value: stats.totalCheckIns || 0,
      unit: 'times',
      color: colors.success,
    },
    {
      icon: 'trending-up',
      label: 'Consistency',
      value: Math.round(stats.consistency || 0),
      unit: '%',
      color: colors.primary,
    },
  ];

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.dark ? colors.backgroundDark : colors.background,
          paddingTop: Platform.OS === 'android' ? 8 : 0,
        }
      ]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.dark ? colors.textDark : colors.text }]}>
            Progress
          </Text>
          <Text style={[styles.subtitle, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
            Track your journey
          </Text>
        </View>

        {/* Level Card */}
        <Animated.View 
          entering={FadeInDown.delay(100)}
          style={[
            styles.levelCard,
            { 
              backgroundColor: theme.dark ? colors.cardDark : colors.card,
              borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
            }
          ]}
        >
          <View style={[styles.levelBadge, { backgroundColor: colors.levelBadge }]}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={32}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
              Current Level
            </Text>
            <Text style={[styles.levelValue, { color: theme.dark ? colors.textDark : colors.text }]}>
              Level {stats.level || 1}
            </Text>
            <Text style={[styles.levelProgress, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
              {stats.xp || 0} / {stats.xpToNextLevel || 100} XP
            </Text>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(200 + index * 100)}
              style={[
                styles.statCard,
                { 
                  backgroundColor: theme.dark ? colors.cardDark : colors.card,
                  borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
                }
              ]}
            >
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <IconSymbol
                  ios_icon_name={stat.icon}
                  android_material_icon_name={stat.icon}
                  size={24}
                  color={stat.color}
                />
              </View>
              <Text style={[styles.statLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                {stat.label}
              </Text>
              <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, { color: theme.dark ? colors.textDark : colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statUnit, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                  {stat.unit}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Calendar Heatmap */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <Text style={[styles.sectionTitle, { color: theme.dark ? colors.textDark : colors.text }]}>
            Activity Calendar
          </Text>
          <View
            style={[
              styles.heatmapCard,
              { 
                backgroundColor: theme.dark ? colors.cardDark : colors.card,
                borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
              }
            ]}
          >
            <View style={styles.heatmapGrid}>
              {heatmapData.map((day, index) => (
                <View
                  key={index}
                  style={[
                    styles.heatmapCell,
                    { 
                      backgroundColor: getHeatmapColor(day.intensity),
                      width: CELL_SIZE - 4,
                      height: CELL_SIZE - 4,
                    }
                  ]}
                />
              ))}
            </View>
            <View style={styles.heatmapLegend}>
              <Text style={[styles.legendText, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                Less
              </Text>
              {[0, 1, 2, 3, 4].map((intensity) => (
                <View
                  key={intensity}
                  style={[
                    styles.legendCell,
                    { backgroundColor: getHeatmapColor(intensity) }
                  ]}
                />
              ))}
              <Text style={[styles.legendText, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                More
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* On-Track Pace Bar */}
        <Animated.View entering={FadeInDown.delay(700)}>
          <Text style={[styles.sectionTitle, { color: theme.dark ? colors.textDark : colors.text }]}>
            Weekly Progress
          </Text>
          <View
            style={[
              styles.paceCard,
              { 
                backgroundColor: theme.dark ? colors.cardDark : colors.card,
                borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
              }
            ]}
          >
            <View style={styles.paceHeader}>
              <Text style={[styles.paceLabel, { color: theme.dark ? colors.textDark : colors.text }]}>
                On-Track Pace
              </Text>
              <Text style={[styles.paceValue, { color: colors.success }]}>
                {insights.onTrackPercentage}%
              </Text>
            </View>
            <View style={[styles.paceBarContainer, { backgroundColor: theme.dark ? '#2D2D2D' : '#EEEEEE' }]}>
              <View 
                style={[
                  styles.paceBar, 
                  { 
                    width: `${insights.onTrackPercentage}%`,
                    backgroundColor: colors.success,
                  }
                ]} 
              />
            </View>
            <Text style={[styles.paceSubtext, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
              You&apos;re {insights.weeklyTrend === 'improving' ? 'improving' : insights.weeklyTrend === 'stable' ? 'maintaining' : 'declining'} this week
            </Text>
          </View>
        </Animated.View>

        {/* Habits Overview */}
        <Animated.View entering={FadeInDown.delay(800)}>
          <Text style={[styles.sectionTitle, { color: theme.dark ? colors.textDark : colors.text }]}>
            Your Habits
          </Text>
          <View
            style={[
              styles.habitsCard,
              { 
                backgroundColor: theme.dark ? colors.cardDark : colors.card,
                borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
              }
            ]}
          >
            <View style={styles.habitsRow}>
              <View style={styles.habitsItem}>
                <Text style={[styles.habitsValue, { color: theme.dark ? colors.textDark : colors.text }]}>
                  {habits.length}
                </Text>
                <Text style={[styles.habitsLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                  Total Habits
                </Text>
              </View>
              <View style={[styles.habitsDivider, { backgroundColor: theme.dark ? colors.borderDark : colors.border }]} />
              <View style={styles.habitsItem}>
                <Text style={[styles.habitsValue, { color: colors.success }]}>
                  {habits.filter(h => h.currentStreak > 0).length}
                </Text>
                <Text style={[styles.habitsLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                  Active Streaks
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Insights */}
        <Animated.View entering={FadeInDown.delay(900)}>
          <Text style={[styles.sectionTitle, { color: theme.dark ? colors.textDark : colors.text }]}>
            Insights
          </Text>
          <View
            style={[
              styles.insightCard,
              { 
                backgroundColor: colors.primary + '15',
                borderColor: colors.primary + '30',
              }
            ]}
          >
            <IconSymbol
              ios_icon_name="lightbulb.fill"
              android_material_icon_name="lightbulb"
              size={28}
              color={colors.primary}
            />
            <View style={styles.insightText}>
              <Text style={[styles.insightTitle, { color: colors.primary }]}>
                {insights.mostConsistentDay ? `You're most consistent on ${insights.mostConsistentDay}` : 'Keep it up!'}
              </Text>
              <Text style={[styles.insightSubtitle, { color: colors.primary }]}>
                {insights.weeklyReview}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Bottom padding for floating tab bar */}
        <View style={{ height: 100 }} />
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
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  levelBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  levelProgress: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    marginHorizontal: '1%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginRight: 4,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  heatmapCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 16,
  },
  heatmapCell: {
    borderRadius: 4,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  paceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  paceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paceLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  paceValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  paceBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  paceBar: {
    height: '100%',
    borderRadius: 6,
  },
  paceSubtext: {
    fontSize: 13,
    fontWeight: '500',
  },
  habitsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  habitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitsItem: {
    flex: 1,
    alignItems: 'center',
  },
  habitsDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  habitsValue: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  habitsLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  insightCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  insightText: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  insightSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
