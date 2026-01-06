
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useHabits, useTodayCheckIns, useUserStats } from '@/hooks/useHabits';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Habit } from '@/types/habit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const FREE_HABIT_LIMIT = 5;

export default function TodayScreen() {
  const { habits, loading, refreshHabits, checkInHabit } = useHabits();
  const { checkIns, refreshCheckIns } = useTodayCheckIns();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { currentTheme } = useAppTheme();
  const stats = useUserStats();
  const [showRestartRitual, setShowRestartRitual] = useState(false);
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
    checkForMissedDays();
  }, [habits, checkIns]);

  useEffect(() => {
    console.log('Initial data load');
    refreshHabits();
    refreshCheckIns();
  }, []);

  const checkForMissedDays = async () => {
    try {
      const lastCheckIn = await AsyncStorage.getItem('last_check_in_date');
      const today = new Date().toISOString().split('T')[0];
      
      if (lastCheckIn && lastCheckIn !== today) {
        const lastDate = new Date(lastCheckIn);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 3) {
          setShowRestartRitual(true);
        }
      }
    } catch (error) {
      console.error('Error checking missed days:', error);
    }
  };

  const handleRestartRitual = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowRestartRitual(false);
      await AsyncStorage.setItem('last_check_in_date', new Date().toISOString().split('T')[0]);
      Alert.alert(
        'Welcome Back! 🎉',
        'You&apos;re back on track! Complete 3 habits in the next 3 days to rebuild your momentum.',
        [{ text: 'Let&apos;s Go!', style: 'default' }]
      );
    } catch (error) {
      console.error('Error restarting ritual:', error);
    }
  };

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
          { text: 'Upgrade', onPress: () => router.push('/(tabs)/profile') },
        ]
      );
      return;
    }
    router.push('/add-habit');
  };

  const handleHabitPress = (habitId: string) => {
    if (isCheckedInToday(habitId)) {
      Alert.alert('Already Checked In', 'You&apos;ve already completed this habit today! 🎉');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/check-in/${habitId}`);
  };

  const isCheckedInToday = (habitId: string) => {
    return checkIns.some(c => c.habitId === habitId);
  };

  const completedCount = todayHabits.filter(h => isCheckedInToday(h.id)).length;
  const totalCount = todayHabits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Today</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.levelBadge}>
            <IconSymbol ios_icon_name="star.fill" android_material_icon_name="star" size={20} color="#F59E0B" />
            <Text style={styles.levelText}>Lvl {stats.stats.level}</Text>
          </View>
        </View>
        
        {totalCount > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                entering={FadeIn}
                style={[styles.progressFill, { width: `${completionPercentage}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedCount}/{totalCount} completed ({completionPercentage}%)
            </Text>
          </View>
        )}
      </LinearGradient>

      {showRestartRitual && (
        <Animated.View entering={FadeInDown}>
          <View style={[styles.restartCard, { backgroundColor: currentTheme.colors.primary }]}>
            <IconSymbol ios_icon_name="arrow.clockwise" android_material_icon_name="refresh" size={32} color="#FFF" />
            <View style={styles.restartContent}>
              <Text style={styles.restartTitle}>Welcome Back!</Text>
              <Text style={styles.restartText}>
                It&apos;s been a few days. Ready to restart your momentum?
              </Text>
            </View>
            <TouchableOpacity style={styles.restartButton} onPress={handleRestartRitual}>
              <Text style={styles.restartButtonText}>Let&apos;s Go!</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {todayHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="tray"
              android_material_icon_name="inbox"
              size={64}
              color={currentTheme?.colors?.textSecondary || '#94A3B8'}
            />
            <Text style={[styles.emptyText, { color: currentTheme?.colors?.textSecondary || '#94A3B8' }]}>
              No habits for today
            </Text>
            <Text style={[styles.emptySubtext, { color: currentTheme?.colors?.textSecondary || '#94A3B8' }]}>
              Tap the + button to add your first habit
            </Text>
          </View>
        ) : (
          todayHabits.map((habit, index) => {
            const isCompleted = isCheckedInToday(habit.id);
            return (
              <Animated.View key={habit.id} entering={FadeInDown.delay(index * 100)}>
                <TouchableOpacity
                  style={[
                    styles.habitCard,
                    { backgroundColor: currentTheme?.colors?.surface || '#1E293B' },
                    isCompleted && styles.habitCardCompleted
                  ]}
                  onPress={() => handleHabitPress(habit.id)}
                  disabled={isCompleted}
                >
                  <View style={[styles.habitIcon, { backgroundColor: habit.color }]}>
                    <IconSymbol ios_icon_name={habit.icon} android_material_icon_name={habit.icon} size={24} color="#FFF" />
                  </View>
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitName, { color: currentTheme?.colors?.text || '#F1F5F9' }]}>
                      {habit.name}
                    </Text>
                    <View style={styles.habitMeta}>
                      <View style={styles.streakBadge}>
                        <IconSymbol ios_icon_name="flame.fill" android_material_icon_name="local-fire-department" size={14} color="#F59E0B" />
                        <Text style={styles.streakText}>{habit.currentStreak} day streak</Text>
                      </View>
                      {habit.tags && habit.tags.length > 0 && (
                        <View style={[styles.tag, { backgroundColor: habit.color + '20' }]}>
                          <Text style={[styles.tagText, { color: habit.color }]}>{habit.tags[0]}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {isCompleted ? (
                    <View style={styles.checkmark}>
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={32}
                        color={currentTheme?.colors?.success || '#10B981'}
                      />
                    </View>
                  ) : (
                    <View style={[styles.checkCircle, { borderColor: habit.color }]}>
                      <View style={[styles.checkCircleInner, { backgroundColor: habit.color + '30' }]} />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: currentTheme?.colors?.primary || '#6366F1' }]}
        onPress={handleAddHabit}
      >
        <IconSymbol ios_icon_name="plus" android_material_icon_name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  levelText: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  progressContainer: { gap: 8 },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
  progressText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  restartCard: { margin: 16, padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  restartContent: { flex: 1 },
  restartTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  restartText: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  restartButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  restartButtonText: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  content: { flex: 1, padding: 16 },
  loadingText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptySubtext: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  habitCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
  habitCardCompleted: { opacity: 0.7 },
  habitIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  habitInfo: { flex: 1, marginLeft: 16 },
  habitName: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  habitMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakText: { fontSize: 12, color: '#F59E0B', fontWeight: '600' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '600' },
  checkmark: { marginLeft: 12 },
  checkCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  checkCircleInner: { width: 16, height: 16, borderRadius: 8 },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
});
