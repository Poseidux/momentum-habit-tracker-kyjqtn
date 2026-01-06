
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits, useTodayCheckIns } from '@/hooks/useHabits';
import { useAppTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const FREE_HABIT_LIMIT = 3;

export default function TodayScreen() {
  const { currentTheme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { habits, loading, refreshHabits, checkInHabit } = useHabits();
  const { checkIns, refreshCheckIns } = useTodayCheckIns();
  const [refreshing, setRefreshing] = useState(false);

  const isPremium = user?.isPremium || false;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshHabits(), refreshCheckIns()]);
    setRefreshing(false);
  };

  const handleAddHabit = () => {
    if (!isPremium && habits.length >= FREE_HABIT_LIMIT) {
      Alert.alert(
        'Upgrade to Premium',
        `Free users can create up to ${FREE_HABIT_LIMIT} habits. Upgrade to Premium for unlimited habits!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/auth/sign-in' as any) }
        ]
      );
      return;
    }
    router.push('/add-habit' as any);
  };

  const handleCheckIn = async (habitId: string) => {
    try {
      await checkInHabit(habitId);
      Alert.alert('Success', 'Habit checked in!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check in');
    }
  };

  const isCheckedInToday = (habitId: string) => {
    return checkIns.some(c => c.habitId === habitId);
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: currentTheme.background }]} 
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Today</Text>
        <TouchableOpacity onPress={handleAddHabit} style={styles.addButton}>
          <LinearGradient
            colors={[currentTheme.primary, currentTheme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <IconSymbol 
              ios_icon_name="plus" 
              android_material_icon_name="add" 
              size={24} 
              color="#FFFFFF" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {habits.length === 0 ? (
          <Animated.View 
            entering={FadeInDown.duration(600)} 
            style={styles.emptyState}
          >
            <View style={[styles.emptyIconContainer, { backgroundColor: currentTheme.card }]}>
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check-circle" 
                size={64} 
                color={currentTheme.primary} 
              />
            </View>
            <Text style={[styles.emptyText, { color: currentTheme.text }]}>No habits yet</Text>
            <Text style={[styles.emptySubtext, { color: currentTheme.textSecondary }]}>
              Tap + to create your first habit
            </Text>
          </Animated.View>
        ) : (
          <>
            {habits.map((habit, index) => {
              const checkedIn = isCheckedInToday(habit.id);
              
              return (
                <Animated.View 
                  key={habit.id} 
                  entering={FadeInDown.delay(index * 100).duration(500)}
                >
                  <TouchableOpacity
                    style={[styles.habitCard, { backgroundColor: currentTheme.card }]}
                    onPress={() => router.push(`/habit/${habit.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.habitCardContent}>
                      <View style={[styles.habitIcon, { backgroundColor: habit.color + '20' }]}>
                        <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
                      </View>
                      
                      <View style={styles.habitInfo}>
                        <Text style={[styles.habitTitle, { color: currentTheme.text }]}>
                          {habit.title}
                        </Text>
                        {habit.description && (
                          <Text 
                            style={[styles.habitDescription, { color: currentTheme.textSecondary }]}
                            numberOfLines={1}
                          >
                            {habit.description}
                          </Text>
                        )}
                        <View style={styles.habitStats}>
                          <View style={styles.statItem}>
                            <IconSymbol 
                              ios_icon_name="flame.fill" 
                              android_material_icon_name="local-fire-department" 
                              size={14} 
                              color={currentTheme.accent} 
                            />
                            <Text style={[styles.statText, { color: currentTheme.textSecondary }]}>
                              {habit.currentStreak || 0} day streak
                            </Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.checkButton,
                          checkedIn && { backgroundColor: currentTheme.success }
                        ]}
                        onPress={() => !checkedIn && handleCheckIn(habit.id)}
                        disabled={checkedIn}
                      >
                        {checkedIn ? (
                          <IconSymbol 
                            ios_icon_name="checkmark" 
                            android_material_icon_name="check" 
                            size={24} 
                            color="#FFFFFF" 
                          />
                        ) : (
                          <View style={[styles.checkCircle, { borderColor: currentTheme.primary }]} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </>
        )}

        {/* Free User Banner */}
        {!isPremium && (
          <Animated.View 
            entering={FadeInDown.delay(habits.length * 100 + 200).duration(500)}
            style={[styles.freeUserBanner, { backgroundColor: currentTheme.card }]}
          >
            <View style={styles.bannerContent}>
              <IconSymbol 
                ios_icon_name="info.circle.fill" 
                android_material_icon_name="info" 
                size={20} 
                color={currentTheme.primary} 
              />
              <Text style={[styles.bannerText, { color: currentTheme.text }]}>
                {habits.length}/{FREE_HABIT_LIMIT} free habits used
              </Text>
            </View>
            {habits.length >= FREE_HABIT_LIMIT && (
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: currentTheme.primary }]}
                onPress={() => router.push('/auth/sign-in' as any)}
              >
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
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
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  addButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  habitCard: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  habitCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  habitIcon: {
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
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    marginBottom: 6,
  },
  habitStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  freeUserBanner: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  upgradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
