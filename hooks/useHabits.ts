
import { useState, useEffect } from 'react';
import { Habit, HabitCheckIn, UserStats } from '@/types/habit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete, isBackendConfigured } from '@/utils/api';

const LOCAL_HABITS_KEY = '@momentum_habits';
const LOCAL_CHECKINS_KEY = '@momentum_checkins';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchHabits();
  }, [user]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      if (user && isBackendConfigured()) {
        const data = await authenticatedGet('/api/habits');
        setHabits(data || []);
      } else {
        const stored = await AsyncStorage.getItem(LOCAL_HABITS_KEY);
        setHabits(stored ? JSON.parse(stored) : []);
      }
    } catch (error) {
      console.error('[useHabits] Error fetching habits:', error);
      const stored = await AsyncStorage.getItem(LOCAL_HABITS_KEY);
      setHabits(stored ? JSON.parse(stored) : []);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'consistency' | 'habitStrength'>) => {
    try {
      if (user && isBackendConfigured()) {
        const newHabit = await authenticatedPost('/api/habits', habit);
        await fetchHabits();
        return newHabit;
      } else {
        const newHabit: Habit = {
          ...habit,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          streak: 0,
          consistency: 0,
          habitStrength: 0
        };
        const updated = [...habits, newHabit];
        await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(updated));
        setHabits(updated);
        return newHabit;
      }
    } catch (error: any) {
      console.error('[useHabits] Error creating habit:', error);
      throw new Error(error.message || 'Failed to create habit');
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      if (user && isBackendConfigured()) {
        await authenticatedPut(`/api/habits/${id}`, updates);
        await fetchHabits();
      } else {
        const updated = habits.map(h => h.id === id ? { ...h, ...updates } : h);
        await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(updated));
        setHabits(updated);
      }
    } catch (error) {
      console.error('[useHabits] Error updating habit:', error);
      throw error;
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      if (user && isBackendConfigured()) {
        await authenticatedDelete(`/api/habits/${id}`);
        await fetchHabits();
      } else {
        const updated = habits.filter(h => h.id !== id);
        await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(updated));
        setHabits(updated);
      }
    } catch (error) {
      console.error('[useHabits] Error deleting habit:', error);
      throw error;
    }
  };

  const checkIn = async (habitId: string, value: number | boolean, note?: string, mood?: number, effort?: number) => {
    try {
      const checkIn: Omit<HabitCheckIn, 'id'> = {
        habitId,
        date: new Date().toISOString().split('T')[0],
        value,
        note,
        mood,
        effort
      };

      if (user && isBackendConfigured()) {
        await authenticatedPost('/api/check-ins', checkIn);
      } else {
        const stored = await AsyncStorage.getItem(LOCAL_CHECKINS_KEY);
        const checkIns = stored ? JSON.parse(stored) : [];
        checkIns.push({ ...checkIn, id: Date.now().toString() });
        await AsyncStorage.setItem(LOCAL_CHECKINS_KEY, JSON.stringify(checkIns));
      }
      await fetchHabits();
    } catch (error) {
      console.error('[useHabits] Error checking in:', error);
      throw error;
    }
  };

  return { habits, loading, addHabit, updateHabit, deleteHabit, checkIn, refetch: fetchHabits };
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      if (user && isBackendConfigured()) {
        const data = await authenticatedGet('/api/stats');
        setStats(data);
      }
    } catch (error) {
      console.error('[useUserStats] Error fetching stats:', error);
    }
  };

  return stats;
}

export function useHabitCheckIns(habitId: string) {
  const [checkIns, setCheckIns] = useState<HabitCheckIn[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchCheckIns();
  }, [habitId, user]);

  const fetchCheckIns = async () => {
    try {
      if (user && isBackendConfigured()) {
        const data = await authenticatedGet(`/api/check-ins?habitId=${habitId}`);
        setCheckIns(data || []);
      } else {
        const stored = await AsyncStorage.getItem(LOCAL_CHECKINS_KEY);
        const all = stored ? JSON.parse(stored) : [];
        setCheckIns(all.filter((c: HabitCheckIn) => c.habitId === habitId));
      }
    } catch (error) {
      console.error('[useHabitCheckIns] Error fetching check-ins:', error);
    }
  };

  return checkIns;
}

export function useTodayCheckIns() {
  const [checkIns, setCheckIns] = useState<HabitCheckIn[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchTodayCheckIns();
  }, [user]);

  const fetchTodayCheckIns = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      if (user && isBackendConfigured()) {
        const data = await authenticatedGet(`/api/check-ins?date=${today}`);
        setCheckIns(data || []);
      } else {
        const stored = await AsyncStorage.getItem(LOCAL_CHECKINS_KEY);
        const all = stored ? JSON.parse(stored) : [];
        setCheckIns(all.filter((c: HabitCheckIn) => c.date === today));
      }
    } catch (error) {
      console.error('[useTodayCheckIns] Error fetching today check-ins:', error);
    }
  };

  return checkIns;
}
