
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useHabits, useTodayCheckIns } from '@/hooks/useHabits';
import { useAuth } from '@/contexts/AuthContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

const FREE_HABIT_LIMIT = 3;

export default function TodayScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { habits, loading, refreshHabits, checkInHabit } = useHabits();
  const { checkIns, refreshCheckIns } = useTodayCheckIns();
  const [refreshing, setRefreshing] = useState(false);

  // Null-safe theme access with fallback colors
  const colors = theme?.colors || {
    background: '#FFFFFF',
    card: '#F2F2F7',
    text: '#000000',
    primary: '#007AFF',
    border: '#E5E5EA',
    accent: '#FF9500',
    success: '#34C759',
    cardBackground: '#F2F2F7'
  };

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
        `Free users can only create ${FREE_HABIT_LIMIT} habits. Sign up for Premium to create unlimited habits!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/auth/sign-up') }
        ]
      );
      return;
    }
    router.push('/add-habit');
  };

  const handleCheckIn = async (habitId: string) => {
    try {
      await checkInHabit(habitId);
      await refreshCheckIns();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check in');
    }
  };

  const isCheckedInToday = (habitId: string) => {
    return checkIns.some(checkIn => checkIn.habitId === habitId);
  };

  const todayHabits = habits.filter(habit => {
    if (habit.schedule === 'daily') return true;
    if (habit.schedule === 'specific_days') {
      const today = new Date().getDay();
      return habit.selectedDays?.includes(today);
    }
    return true;
  });

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Today</Text>
        <TouchableOpacity onPress={handleAddHabit}>
          <IconSymbol 
            ios_icon_name="plus.circle.fill" 
            android_material_icon_name="add-circle" 
            size={28} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <Text style={[styles.emptyText, { color: colors.text }]}>Loading...</Text>
        ) : todayHabits.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No habits yet. Tap + to add your first habit!
          </Text>
        ) : (
          todayHabits.map((habit, index) => {
            const checkedIn = isCheckedInToday(habit.id);
            return (
              <Animated.View
                key={habit.id}
                entering={FadeInDown.delay(index * 100)}
              >
                <TouchableOpacity
                  style={[
                    styles.habitCard,
                    { backgroundColor: colors.cardBackground, borderColor: colors.border }
                  ]}
                  onPress={() => router.push(`/habit/${habit.id}`)}
                >
                  <View style={styles.habitInfo}>
                    <View style={[styles.iconCircle, { backgroundColor: habit.color || colors.primary }]}>
                      <Text style={styles.iconText}>{habit.icon || '✓'}</Text>
                    </View>
                    <View style={styles.habitDetails}>
                      <Text style={[styles.habitTitle, { color: colors.text }]}>{habit.title}</Text>
                      {habit.description && (
                        <Text style={[styles.habitDescription, { color: colors.text }]} numberOfLines={1}>
                          {habit.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.checkButton,
                      checkedIn && { backgroundColor: colors.success }
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (!checkedIn) {
                        handleCheckIn(habit.id);
                      }
                    }}
                  >
                    {checkedIn && (
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={20}
                        color="#FFFFFF"
                      />
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  habitDetails: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  habitDescription: {
    fontSize: 14,
    opacity: 0.6,
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
