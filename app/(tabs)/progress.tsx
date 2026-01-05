
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useHabits, useUserStats } from '@/hooks/useHabits';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProgressScreen() {
  const theme = useTheme();
  const { stats } = useUserStats();
  const { habits } = useHabits();

  const statCards = [
    {
      icon: 'local-fire-department',
      label: 'Current Streak',
      value: stats.currentStreak || 0,
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
      value: stats.consistency || 0,
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
          paddingTop: Platform.OS === 'android' ? 20 : 0,
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

        {/* Habits Overview */}
        <Animated.View entering={FadeInDown.delay(600)}>
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
        <Animated.View entering={FadeInDown.delay(700)}>
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
                Keep it up!
              </Text>
              <Text style={[styles.insightSubtitle, { color: colors.primary }]}>
                You&apos;re building great momentum. Consistency is key to forming lasting habits.
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
