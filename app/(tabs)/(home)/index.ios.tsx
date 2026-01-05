
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useHabits, useUserStats } from '@/hooks/useHabits';
import HabitCard from '@/components/HabitCard';
import XPBar from '@/components/XPBar';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function TodayScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { habits, loading, checkInHabit, refreshHabits } = useHabits();
  const { stats, refreshStats } = useUserStats();
  const [refreshing, setRefreshing] = useState(false);
  const [checkedHabits, setCheckedHabits] = useState<Set<string>>(new Set());

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshHabits(), refreshStats()]);
    } catch (error) {
      console.error('[TodayScreen] Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCheckIn = async (habitId: string) => {
    if (checkedHabits.has(habitId)) return;
    
    try {
      await checkInHabit(habitId);
      setCheckedHabits(new Set([...checkedHabits, habitId]));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('[TodayScreen] Error checking in habit:', error);
      Alert.alert('Error', error.message || 'Failed to record check-in. Please try again.');
    }
  };

  const handleHabitPress = (habitId: string) => {
    router.push(`/habit/${habitId}`);
  };

  const handleAddHabit = () => {
    router.push('/add-habit');
  };

  const allHabitsChecked = habits.length > 0 && checkedHabits.size === habits.length;

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.dark ? colors.backgroundDark : colors.background,
        }
      ]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.dark ? colors.textDark : colors.text }]}>
              Today
            </Text>
            <Text style={[styles.date, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* XP Bar */}
        <Animated.View entering={FadeIn.delay(100)}>
          <XPBar level={stats.level} xp={stats.xp} xpToNextLevel={stats.xpToNextLevel} />
        </Animated.View>

        {/* All Done Celebration */}
        {allHabitsChecked && (
          <Animated.View 
            entering={FadeInDown.springify()}
            style={[
              styles.celebrationCard,
              { 
                backgroundColor: colors.success + '15',
                borderColor: colors.success + '30',
              }
            ]}
          >
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={32}
              color={colors.success}
            />
            <Text style={[styles.celebrationText, { color: colors.success }]}>
              All done for today! 🎉
            </Text>
            <Text style={[styles.celebrationSubtext, { color: colors.success }]}>
              You&apos;re building amazing momentum!
            </Text>
          </Animated.View>
        )}

        {/* Habits List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.dark ? colors.textDark : colors.text }]}>
            Your Habits
          </Text>
          
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                Loading your habits...
              </Text>
            </View>
          ) : habits.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="plus.circle"
                android_material_icon_name="add-circle"
                size={64}
                color={theme.dark ? colors.textSecondaryDark : colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                No habits yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.dark ? colors.textSecondaryDark : colors.textSecondary }]}>
                Tap the + button to create your first habit
              </Text>
            </View>
          ) : (
            habits.map((habit, index) => (
              <Animated.View key={habit.id} entering={FadeInDown.delay(index * 100)}>
                <HabitCard
                  habit={habit}
                  onCheckIn={() => handleCheckIn(habit.id)}
                  onPress={() => handleHabitPress(habit.id)}
                  isCheckedToday={checkedHabits.has(habit.id)}
                />
              </Animated.View>
            ))
          )}
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddHabit}
        activeOpacity={0.8}
      >
        <IconSymbol
          ios_icon_name="plus"
          android_material_icon_name="add"
          size={28}
          color="#FFFFFF"
        />
      </TouchableOpacity>
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
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    fontWeight: '500',
  },
  celebrationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  celebrationText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  celebrationSubtext: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
});
