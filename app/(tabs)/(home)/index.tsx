
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useHabits, useTodayCheckIns, useUserStats } from '@/hooks/useHabits';
import { IconSymbol } from '@/components/IconSymbol';
import { Habit } from '@/types/habit';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { spacing, typography, borderRadius, shadows } from '@/styles/commonStyles';
import Svg, { Circle } from 'react-native-svg';

const FREE_HABIT_LIMIT = 5;

export default function TodayScreen() {
  const { habits, loading, refreshHabits } = useHabits();
  const { checkIns, refreshCheckIns } = useTodayCheckIns();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { isDark, colors } = useAppTheme();
  const stats = useUserStats();
  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const today = new Date().getDay();
    const filtered = habits.filter(habit => {
      if (habit.schedule === 'daily') return true;
      if (habit.schedule === 'specific_days' && habit.specificDays) {
        return habit.specificDays.includes(today);
      }
      return true;
    });
    setTodayHabits(filtered);
  }, [habits, checkIns]);

  useEffect(() => {
    refreshHabits();
    refreshCheckIns();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshHabits();
    await refreshCheckIns();
    setRefreshing(false);
  };

  const handleAddHabit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!user?.isPremium && habits.length >= FREE_HABIT_LIMIT) {
      router.push('/(tabs)/profile');
      return;
    }
    router.push('/add-habit');
  };

  const handleHabitPress = async (habitId: string) => {
    if (isCheckedInToday(habitId)) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/check-in/${habitId}`);
  };

  const isCheckedInToday = (habitId: string) => {
    return checkIns.some(c => c.habitId === habitId);
  };

  const completedCount = todayHabits.filter(h => isCheckedInToday(h.id)).length;
  const totalCount = todayHabits.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) : 0;

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Format date
  const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Header - Greeting + Date */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>{getGreeting()}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{getFormattedDate()}</Text>
        </Animated.View>

        {/* Daily Completion Ring */}
        {totalCount > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.ringContainer}>
            <View style={styles.ringWrapper}>
              <Svg width={160} height={160}>
                {/* Background circle */}
                <Circle
                  cx={80}
                  cy={80}
                  r={70}
                  stroke={colors.progressBg}
                  strokeWidth={10}
                  fill="none"
                />
                {/* Progress circle */}
                <Circle
                  cx={80}
                  cy={80}
                  r={70}
                  stroke={colors.accent}
                  strokeWidth={10}
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - completionPercentage)}`}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="80, 80"
                />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={[styles.ringPercentage, { color: colors.text }]}>
                  {Math.round(completionPercentage * 100)}%
                </Text>
                <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>Complete</Text>
              </View>
            </View>
            <Text style={[styles.ringSubtext, { color: colors.textSecondary }]}>
              {completedCount} of {totalCount} habits
            </Text>
          </Animated.View>
        )}

        {/* Today's Habits Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today&apos;s Habits</Text>
          
          {todayHabits.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
                <IconSymbol
                  ios_icon_name="tray"
                  android_material_icon_name="inbox"
                  size={32}
                  color={colors.textTertiary}
                />
              </View>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No habits for today
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                Tap the + button to create your first habit
              </Text>
            </Animated.View>
          ) : (
            todayHabits.map((habit, index) => {
              const isCompleted = isCheckedInToday(habit.id);
              return (
                <Animated.View key={habit.id} entering={FadeInDown.delay(200 + index * 50).duration(500)}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.habitCard,
                      { backgroundColor: colors.surface },
                      pressed && styles.habitCardPressed,
                      isCompleted && styles.habitCardCompleted,
                    ]}
                    onPress={() => handleHabitPress(habit.id)}
                    disabled={isCompleted}
                  >
                    {/* Habit Info */}
                    <View style={styles.habitInfo}>
                      <Text 
                        style={[
                          styles.habitName, 
                          { color: colors.text },
                          isCompleted && { color: colors.textSecondary }
                        ]}
                        numberOfLines={1}
                      >
                        {habit.name}
                      </Text>
                      
                      {/* Metadata row */}
                      <View style={styles.habitMeta}>
                        {/* Status chip */}
                        {isCompleted ? (
                          <View style={[styles.statusChip, { backgroundColor: colors.success + '20' }]}>
                            <IconSymbol
                              ios_icon_name="checkmark"
                              android_material_icon_name="check"
                              size={10}
                              color={colors.success}
                            />
                            <Text style={[styles.statusText, { color: colors.success }]}>Done</Text>
                          </View>
                        ) : (
                          <View style={[styles.statusChip, { backgroundColor: colors.accent + '15' }]}>
                            <Text style={[styles.statusText, { color: colors.accent }]}>Pending</Text>
                          </View>
                        )}
                        
                        {/* Streak indicator */}
                        {habit.currentStreak > 0 && (
                          <View style={styles.streakBadge}>
                            <IconSymbol
                              ios_icon_name="flame.fill"
                              android_material_icon_name="local-fire-department"
                              size={12}
                              color={colors.warning}
                            />
                            <Text style={[styles.streakText, { color: colors.textSecondary }]}>
                              {habit.currentStreak}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Check button */}
                    <Pressable
                      style={({ pressed }) => [
                        styles.checkButton,
                        { 
                          backgroundColor: isCompleted ? colors.success : colors.accent,
                        },
                        pressed && styles.checkButtonPressed,
                      ]}
                      onPress={() => handleHabitPress(habit.id)}
                      disabled={isCompleted}
                    >
                      <IconSymbol
                        ios_icon_name={isCompleted ? 'checkmark' : 'plus'}
                        android_material_icon_name={isCompleted ? 'check' : 'add'}
                        size={24}
                        color="#FFFFFF"
                      />
                    </Pressable>
                  </Pressable>
                </Animated.View>
              );
            })
          )}
        </View>

        {/* Bottom padding for floating tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.accent },
          pressed && styles.fabPressed,
        ]}
        onPress={handleAddHabit}
      >
        <IconSymbol ios_icon_name="plus" android_material_icon_name="add" size={24} color="#FFFFFF" />
      </Pressable>
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
    paddingTop: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
  },
  
  // Header
  header: {
    marginBottom: spacing.xxl,
  },
  greeting: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.caption,
  },
  
  // Completion Ring
  ringContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercentage: {
    ...typography.display,
    fontSize: 36,
    fontWeight: '600',
  },
  ringLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  ringSubtext: {
    ...typography.caption,
  },
  
  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.section,
    marginBottom: spacing.md,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  emptyText: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.caption,
    textAlign: 'center',
    maxWidth: 240,
  },
  
  // Habit Card
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  habitCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  habitCardCompleted: {
    opacity: 0.6,
  },
  habitInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  habitName: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.micro,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakText: {
    ...typography.caption,
    fontWeight: '500',
  },
  
  // Check Button
  checkButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  checkButtonPressed: {
    transform: [{ scale: 0.9 }],
  },
  
  // FAB
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
});
