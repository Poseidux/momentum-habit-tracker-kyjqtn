
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useHabits, useTodayCheckIns } from '@/hooks/useHabits';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const FREE_HABIT_LIMIT = 3;

export default function TodayScreen() {
  const { habits, loading, refreshHabits } = useHabits();
  const { user } = useAuth();
  const { checkIns, checkIn, refreshCheckIns } = useTodayCheckIns();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { currentTheme } = useAppTheme();

  const [todayHabits, setTodayHabits] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().getDay();
    const filtered = habits.filter(habit => {
      if (habit.schedule === 'daily') return true;
      if (habit.schedule === 'specific_days' && habit.scheduleDays) {
        return habit.scheduleDays.includes(today);
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
    await Promise.all([refreshHabits(), refreshCheckIns()]);
    setRefreshing(false);
  };

  const handleAddHabit = () => {
    if (!user && habits.length >= FREE_HABIT_LIMIT) {
      Alert.alert(
        'Upgrade to Premium',
        `Free users can create up to ${FREE_HABIT_LIMIT} habits. Upgrade to Premium for unlimited habits!`,
        [{ text: 'OK' }]
      );
      return;
    }
    router.push('/add-habit');
  };

  const handleCheckIn = async (habitId: string) => {
    try {
      await checkIn(habitId);
      await refreshHabits();
    } catch (error) {
      Alert.alert('Error', 'Failed to check in');
    }
  };

  const isCheckedInToday = (habitId: string) => {
    return checkIns.some(c => c.habitId === habitId);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: currentTheme.colors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} edges={['top']}>
      <LinearGradient
        colors={currentTheme.colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Today</Text>
        <Text style={styles.headerSubtitle}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentTheme.colors.primary} />}
      >
        {todayHabits.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(100)} style={styles.emptyState}>
            <IconSymbol ios_icon_name="calendar" android_material_icon_name="event" size={64} color={currentTheme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: currentTheme.colors.text }]}>No habits for today</Text>
            <Text style={[styles.emptySubtitle, { color: currentTheme.colors.textSecondary }]}>
              Start building momentum by adding your first habit
            </Text>
          </Animated.View>
        ) : (
          todayHabits.map((habit, index) => {
            const checked = isCheckedInToday(habit.id);
            return (
              <Animated.View key={habit.id} entering={FadeInDown.delay(index * 100)}>
                <TouchableOpacity
                  style={[styles.habitCard, { backgroundColor: currentTheme.colors.surface }]}
                  onPress={() => handleCheckIn(habit.id)}
                  disabled={checked}
                >
                  <View style={styles.habitLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: habit.color + '20' }]}>
                      <IconSymbol
                        ios_icon_name={habit.icon || 'checkmark.circle'}
                        android_material_icon_name="check-circle"
                        size={24}
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
                  <View style={[styles.checkButton, checked && { backgroundColor: currentTheme.colors.success }]}>
                    {checked && <IconSymbol ios_icon_name="checkmark" android_material_icon_name="check" size={20} color="#FFF" />}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: currentTheme.colors.primary }]}
        onPress={handleAddHabit}
      >
        <IconSymbol ios_icon_name="plus" android_material_icon_name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
