
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
import { Habit } from '@/types/habit';

const FREE_HABIT_LIMIT = 5;

export default function TodayScreen() {
  const { habits, loading, refreshHabits, checkInHabit } = useHabits();
  const { checkIns, refreshCheckIns } = useTodayCheckIns();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { currentTheme } = useAppTheme();

  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);

  useEffect(() => {
    console.log('TodayScreen mounted, habits:', habits.length);
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
    console.log('Initial data load');
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
    if (!user?.isPremium && habits.length >= FREE_HABIT_LIMIT) {
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
      await checkInHabit(habitId);
      await refreshCheckIns();
      Alert.alert('Success', 'Habit checked in!');
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Error', 'Failed to check in habit');
    }
  };

  const isCheckedInToday = (habitId: string) => {
    return checkIns.some(c => c.habitId === habitId);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.colors?.background || '#0F172A' }]} edges={['top']}>
        <Text style={[styles.loadingText, { color: currentTheme?.colors?.text || '#F1F5F9' }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.colors?.background || '#0F172A' }]} edges={['top']}>
      <LinearGradient
        colors={currentTheme?.colors?.gradient || ['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Today</Text>
        <Text style={styles.headerSubtitle}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {todayHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: currentTheme?.colors?.textSecondary || '#94A3B8' }]}>
              No habits for today. Add your first habit!
            </Text>
          </View>
        ) : (
          todayHabits.map((habit, index) => (
            <Animated.View key={habit.id} entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity
                style={[styles.habitCard, { backgroundColor: currentTheme?.colors?.surface || '#1E293B' }]}
                onPress={() => handleCheckIn(habit.id)}
                disabled={isCheckedInToday(habit.id)}
              >
                <View style={[styles.habitIcon, { backgroundColor: habit.color }]}>
                  <IconSymbol ios_icon_name={habit.icon} android_material_icon_name={habit.icon} size={24} color="#FFF" />
                </View>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, { color: currentTheme?.colors?.text || '#F1F5F9' }]}>{habit.name}</Text>
                  <Text style={[styles.habitStreak, { color: currentTheme?.colors?.textSecondary || '#94A3B8' }]}>
                    🔥 {habit.currentStreak} day streak
                  </Text>
                </View>
                {isCheckedInToday(habit.id) && (
                  <View style={styles.checkmark}>
                    <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check-circle" size={28} color={currentTheme?.colors?.success || '#10B981'} />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: currentTheme?.colors?.primary || '#6366F1' }]} onPress={handleAddHabit}>
        <IconSymbol ios_icon_name="plus" android_material_icon_name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 16 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 16, color: '#FFF', opacity: 0.9, marginTop: 4 },
  content: { flex: 1, padding: 16 },
  loadingText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  habitCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
  habitIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  habitInfo: { flex: 1, marginLeft: 16 },
  habitName: { fontSize: 18, fontWeight: '600' },
  habitStreak: { fontSize: 14, marginTop: 4 },
  checkmark: { marginLeft: 12 },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
});
