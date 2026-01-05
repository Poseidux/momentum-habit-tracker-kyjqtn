
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { useHabits, useUserStats } from '@/hooks/useHabits';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProgressScreen() {
  const theme = useTheme();
  const { habits, loading: habitsLoading } = useHabits();
  const { stats, loading: statsLoading } = useUserStats();

  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const avgConsistency = habits.length > 0 
    ? Math.round(habits.reduce((sum, h) => sum + h.consistencyPercent, 0) / habits.length)
    : 0;

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.dark ? colors.backgroundDark : colors.background }]}
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

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Animated.View 
            entering={FadeInDown.delay(100)}
            style={[
              styles.statCard,
              { 
                backgroundColor: theme.dark ? colors.cardDark : colors.card,
                borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
              }
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol
                ios_icon_name="local-fire-department"
                android_material_icon_name="local-fire-department"
                size={28}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.statValue, { color: theme.dark ? colors.textDark : colors.text }]}>
              {totalStreak}
            </Text>
            <Text style={[styles.statLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
              Total Streaks
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(200)}
            style={[
              styles.statCard,
              { 
                backgroundColor: theme.dark ? colors.cardDark : colors.card,
                borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
              }
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
              <IconSymbol
                ios_icon_name="check-circle"
                android_material_icon_name="check-circle"
                size={28}
                color={colors.success}
              />
            </View>
            <Text style={[styles.statValue, { color: theme.dark ? colors.textDark : colors.text }]}>
              {stats.totalCheckIns}
            </Text>
            <Text style={[styles.statLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
              Check-ins
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(300)}
            style={[
              styles.statCard,
              { 
                backgroundColor: theme.dark ? colors.cardDark : colors.card,
                borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
              }
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.secondary + '20' }]}>
              <IconSymbol
                ios_icon_name="trending-up"
                android_material_icon_name="trending-up"
                size={28}
                color={colors.secondary}
              />
            </View>
            <Text style={[styles.statValue, { color: theme.dark ? colors.textDark : colors.text }]}>
              {avgConsistency}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
              Consistency
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(400)}
            style={[
              styles.statCard,
              { 
                backgroundColor: theme.dark ? colors.cardDark : colors.card,
                borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
              }
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.accent + '20' }]}>
              <IconSymbol
                ios_icon_name="star"
                android_material_icon_name="star"
                size={28}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.statValue, { color: theme.dark ? colors.textDark : colors.text }]}>
              {stats.level}
            </Text>
            <Text style={[styles.statLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
              Level
            </Text>
          </Animated.View>
        </View>

        {/* Habits Performance */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.dark ? colors.textDark : colors.text }]}>
            Habit Performance
          </Text>
          
          {habits.map((habit, index) => (
            <View
              key={habit.id}
              style={[
                styles.habitPerformanceCard,
                { 
                  backgroundColor: theme.dark ? colors.cardDark : colors.card,
                  borderColor: theme.dark ? colors.cardBorderDark : colors.cardBorder,
                }
              ]}
            >
              <View style={styles.habitPerformanceHeader}>
                <View style={[styles.habitIcon, { backgroundColor: habit.color + '20' }]}>
                  <IconSymbol
                    ios_icon_name={habit.icon}
                    android_material_icon_name={habit.icon}
                    size={20}
                    color={habit.color}
                  />
                </View>
                <Text style={[styles.habitPerformanceTitle, { color: theme.dark ? colors.textDark : colors.text }]}>
                  {habit.title}
                </Text>
              </View>
              
              <View style={styles.habitStats}>
                <View style={styles.habitStat}>
                  <Text style={[styles.habitStatValue, { color: theme.dark ? colors.textDark : colors.text }]}>
                    {habit.currentStreak}
                  </Text>
                  <Text style={[styles.habitStatLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                    Current Streak
                  </Text>
                </View>
                <View style={styles.habitStat}>
                  <Text style={[styles.habitStatValue, { color: theme.dark ? colors.textDark : colors.text }]}>
                    {habit.longestStreak}
                  </Text>
                  <Text style={[styles.habitStatLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                    Best Streak
                  </Text>
                </View>
                <View style={styles.habitStat}>
                  <Text style={[styles.habitStatValue, { color: theme.dark ? colors.textDark : colors.text }]}>
                    {habit.totalCompletions}
                  </Text>
                  <Text style={[styles.habitStatLabel, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                    Total
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Insights */}
        <Animated.View 
          entering={FadeInDown.delay(600)}
          style={[
            styles.insightsCard,
            { 
              backgroundColor: colors.primary + '15',
              borderColor: colors.primary + '30',
            }
          ]}
        >
          <IconSymbol
            ios_icon_name="lightbulb"
            android_material_icon_name="lightbulb"
            size={24}
            color={colors.primary}
          />
          <View style={styles.insightsText}>
            <Text style={[styles.insightsTitle, { color: colors.primary }]}>
              Insight
            </Text>
            <Text style={[styles.insightsContent, { color: colors.primary }]}>
              You&apos;re most consistent on weekdays. Keep up the great work!
            </Text>
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
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
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
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  habitPerformanceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  habitPerformanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitPerformanceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  habitStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  habitStat: {
    alignItems: 'center',
  },
  habitStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  habitStatLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  insightsCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  insightsText: {
    flex: 1,
    marginLeft: 12,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  insightsContent: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
