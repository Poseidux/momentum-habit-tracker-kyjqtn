
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';
import HabitCard from '@/components/HabitCard';
import XPBar from '@/components/XPBar';
import { useHabits, useUserStats } from '@/hooks/useHabits';

export default function TodayScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { habits, loading, checkInHabit, refreshHabits } = useHabits();
  const { stats } = useUserStats();
  const router = useRouter();
  const theme = useTheme();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshHabits();
    setRefreshing(false);
  };

  const handleCheckIn = async (habitId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // TODO: Backend Integration - Record check-in via API endpoint
      await checkInHabit(habitId, 1);
      Alert.alert('✨ Great job!', 'Keep up the momentum!');
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Error', 'Failed to check in. Please try again.');
    }
  };

  const handleHabitPress = (habitId: string) => {
    router.push(`/habit/${habitId}` as any);
  };

  const handleAddHabit = () => {
    router.push('/add-habit' as any);
  };

  const todayHabits = habits.filter(h => {
    const today = new Date().getDay();
    if (h.schedule === 'daily') return true;
    return true;
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Today</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text, opacity: 0.6 }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>

          {stats && <XPBar xp={stats.xp} level={stats.level} />}

          <View style={styles.habitsContainer}>
            {loading ? (
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>Loading...</Text>
            ) : todayHabits.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol 
                  ios_icon_name="sparkles" 
                  android_material_icon_name="auto-awesome" 
                  size={48} 
                  color={theme.colors.text} 
                  style={{ opacity: 0.3 }} 
                />
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>No habits yet</Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.text }]}>
                  Tap the + button to create your first habit
                </Text>
              </View>
            ) : (
              todayHabits.map((habit, index) => (
                <Animated.View key={habit.id} entering={FadeInDown.delay(index * 100)}>
                  <HabitCard
                    habit={habit}
                    onCheckIn={() => handleCheckIn(habit.id)}
                    onPress={() => handleHabitPress(habit.id)}
                  />
                </Animated.View>
              ))
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#007AFF' }]}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    marginTop: 0,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  habitsContainer: {
    marginTop: 20,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    opacity: 0.5,
  },
  emptySubtext: {
    fontSize: 15,
    marginTop: 8,
    opacity: 0.4,
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
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
