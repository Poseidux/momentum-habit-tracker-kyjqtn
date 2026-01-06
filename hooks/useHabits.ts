
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, CheckIn, UserStats } from '@/types/habit';
import { authenticatedGet, authenticatedPost, isBackendConfigured } from '@/utils/api';

const HABITS_KEY = 'momentum_habits';
const CHECKINS_KEY = 'momentum_checkins';
const STATS_KEY = 'momentum_stats';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshHabits();
  }, []);

  const refreshHabits = useCallback(async () => {
    try {
      setLoading(true);
      if (isBackendConfigured()) {
        const response = await authenticatedGet('/habits');
        if (response.habits) {
          setHabits(response.habits);
          await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(response.habits));
        }
      } else {
        const stored = await AsyncStorage.getItem(HABITS_KEY);
        if (stored) {
          setHabits(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Failed to load habits:', error);
      const stored = await AsyncStorage.getItem(HABITS_KEY);
      if (stored) {
        setHabits(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const saveHabit = useCallback(async (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newHabit: Habit = {
        ...habit,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isBackendConfigured()) {
        const response = await authenticatedPost('/habits', newHabit);
        if (response.habit) {
          const updatedHabits = [...habits, response.habit];
          setHabits(updatedHabits);
          await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits));
          return response.habit;
        }
      } else {
        const updatedHabits = [...habits, newHabit];
        setHabits(updatedHabits);
        await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits));
        return newHabit;
      }
    } catch (error) {
      console.error('Failed to save habit:', error);
      throw error;
    }
  }, [habits]);

  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      if (isBackendConfigured()) {
        await authenticatedPost(`/habits/${habitId}/delete`, {});
      }
      const updatedHabits = habits.filter((h) => h.id !== habitId);
      setHabits(updatedHabits);
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits));
    } catch (error) {
      console.error('Failed to delete habit:', error);
      throw error;
    }
  }, [habits]);

  const checkInHabit = useCallback(async (habitId: string, value: number, note?: string, mood?: number, effort?: number) => {
    try {
      const checkIn: CheckIn = {
        id: Date.now().toString(),
        habitId,
        userId: 'local',
        date: new Date().toISOString().split('T')[0],
        value,
        note,
        mood,
        effort,
        createdAt: new Date().toISOString(),
      };

      if (isBackendConfigured()) {
        await authenticatedPost('/check-ins', checkIn);
      }

      const stored = await AsyncStorage.getItem(CHECKINS_KEY);
      const checkIns: CheckIn[] = stored ? JSON.parse(stored) : [];
      checkIns.push(checkIn);
      await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns));
    } catch (error) {
      console.error('Failed to check in:', error);
      throw error;
    }
  }, []);

  return {
    habits,
    loading,
    refreshHabits,
    saveHabit,
    deleteHabit,
    checkInHabit,
  };
}

export function useTodayCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshCheckIns();
  }, []);

  const refreshCheckIns = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      if (isBackendConfigured()) {
        const response = await authenticatedGet(`/check-ins?date=${today}`);
        if (response.checkIns) {
          setCheckIns(response.checkIns);
        }
      } else {
        const stored = await AsyncStorage.getItem(CHECKINS_KEY);
        if (stored) {
          const allCheckIns: CheckIn[] = JSON.parse(stored);
          const todayCheckIns = allCheckIns.filter((c) => c.date === today);
          setCheckIns(todayCheckIns);
        }
      }
    } catch (error) {
      console.error('Failed to load check-ins:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { checkIns, loading, refreshCheckIns };
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    badges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      if (isBackendConfigured()) {
        const response = await authenticatedGet('/stats');
        if (response.stats) {
          setStats(response.stats);
        }
      } else {
        const stored = await AsyncStorage.getItem(STATS_KEY);
        if (stored) {
          setStats(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addXP = useCallback(async (xp: number) => {
    const newStats = {
      ...stats,
      totalXP: stats.totalXP + xp,
      level: Math.floor((stats.totalXP + xp) / 100) + 1,
    };
    setStats(newStats);
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
  }, [stats]);

  return { stats, loading, refreshStats, addXP };
}
