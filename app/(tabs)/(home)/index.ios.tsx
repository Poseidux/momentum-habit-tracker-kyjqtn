
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits, useTodayCheckIns } from '@/hooks/useHabits';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

const FREE_HABIT_LIMIT = 3;

export default function TodayScreen() {
  const { habits, loading, refreshHabits, checkInHabit } = useHabits();
  const { checkIns, refreshCheckIns } = useTodayCheckIns();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { theme } = useAppTheme();

  useEffect(() => {
    console.log('TodayScreen mounted, loading habits...');
    refreshHabits();
    refreshCheckIns();
  }, []);

  useEffect(() => {
    console.log('Habits loaded:', habits.length, 'habits');
    console.log('Check-ins loaded:', checkIns.length, 'check-ins');
  }, [habits, checkIns]);

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
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/profile') },
        ]
      );
      return;
    }
    router.push('/add-habit');
  };

  const handleCheckIn = async (habitId: string) => {
    try {
      console.log('Checking in habit:', habitId);
      await checkInHabit(habitId, {});
      await refreshCheckIns();
      await refreshHabits();
    } catch (error) {
      console.error('Error checking in habit:', error);
      Alert.alert('Error', 'Failed to check in habit');
    }
  };

  const isCheckedInToday = (habitId: string) => {
    return checkIns.some(c => c.habitId === habitId);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]} edges={['top']}>
      <LinearGradient
        colors={[theme.colors.primary + '20', theme.colors.surface]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Today</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>

          {habits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No habits yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Create your first habit to get started!
              </Text>
            </View>
          ) : (
            <View style={styles.habitsList}>
              {habits.map((habit, index) => {
                const checkedIn = isCheckedInToday(habit.id);
                return (
                  <Animated.View
                    key={`habit-${habit.id}`}
                    entering={FadeInDown.delay(index * 100)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.habitCard,
                        { backgroundColor: theme.colors.surface + 'CC' },
                        checkedIn && { borderColor: theme.colors.success, borderWidth: 2 }
                      ]}
                      onPress={() => router.push(`/habit/${habit.id}`)}
                    >
                      <View style={styles.habitContent}>
                        <View style={[styles.iconContainer, { backgroundColor: habit.color || theme.colors.primary }]}>
                          <Text style={styles.iconEmoji}>{habit.icon.emoji}</Text>
                        </View>
                        <View style={styles.habitInfo}>
                          <Text style={[styles.habitName, { color: theme.colors.text }]}>{habit.name}</Text>
                          {habit.description && (
                            <Text style={[styles.habitDescription, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                              {habit.description}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.checkButton,
                            { backgroundColor: checkedIn ? theme.colors.success : theme.colors.primary }
                          ]}
                          onPress={(e) => {
                            e.stopPropagation();
                            if (!checkedIn) {
                              handleCheckIn(habit.id);
                            }
                          }}
                        >
                          <IconSymbol
                            name={checkedIn ? 'check' : 'add'}
                            size={24}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddHabit}
        >
          <IconSymbol name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  habitsList: {
    gap: 12,
  },
  habitCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  habitDescription: {
    fontSize: 14,
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
