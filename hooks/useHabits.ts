
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitCheckIn, UserStats } from '@/types/habit';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete, isBackendConfigured } from '@/utils/api';

const HABITS_STORAGE_KEY = '@momentum_habits';
const CHECKINS_STORAGE_KEY = '@momentum_checkins';

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (user && isBackendConfigured()) {
        const response = await authenticatedGet('/api/habits');
        setHabits(response.habits || []);
      } else {
        const stored = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
        setHabits(stored ? JSON.parse(stored) : []);
      }
    } catch (err) {
      console.error('Error loading habits:', err);
      setError('Failed to load habits');
      const stored = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
      setHabits(stored ? JSON.parse(stored) : []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const addHabit = async (habit: Omit<Habit, 'id'>) => {
    try {
      const newHabit: Habit = {
        ...habit,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      if (user && isBackendConfigured()) {
        const response = await authenticatedPost('/api/habits', newHabit);
        await loadHabits();
        return response.habit;
      } else {
        const updated = [...habits, newHabit];
        setHabits(updated);
        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updated));
        return newHabit;
      }
    } catch (err) {
      console.error('Error adding habit:', err);
      throw err;
    }
  };

  const updateHabit = async (habit: Habit) => {
    try {
      if (user && isBackendConfigured()) {
        await authenticatedPut(`/api/habits/${habit.id}`, habit);
        await loadHabits();
      } else {
        const updated = habits.map(h => h.id === habit.id ? habit : h);
        setHabits(updated);
        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Error updating habit:', err);
      throw err;
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      if (user && isBackendConfigured()) {
        await authenticatedDelete(`/api/habits/${id}`);
        await loadHabits();
      } else {
        const updated = habits.filter(h => h.id !== id);
        setHabits(updated);
        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Error deleting habit:', err);
      throw err;
    }
  };

  const checkInHabit = async (habitId: string, data: Partial<HabitCheckIn>) => {
    try {
      if (user && isBackendConfigured()) {
        const response = await authenticatedPost('/api/check-ins', {
          habitId,
          date: new Date().toISOString().split('T')[0],
          ...data,
        });
        await loadHabits();
        return response;
      } else {
        const stored = await AsyncStorage.getItem(CHECKINS_STORAGE_KEY);
        const checkIns: HabitCheckIn[] = stored ? JSON.parse(stored) : [];
        const newCheckIn: HabitCheckIn = {
          id: Date.now().toString(),
          habitId,
          date: new Date().toISOString().split('T')[0],
          ...data,
        };
        checkIns.push(newCheckIn);
        await AsyncStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(checkIns));
        return newCheckIn;
      }
    } catch (err) {
      console.error('Error checking in habit:', err);
      throw err;
    }
  };

  return {
    habits,
    loading,
    error,
    refreshHabits: loadHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    checkInHabit,
  };
};

export const useTodayCheckIns = () => {
  const [checkIns, setCheckIns] = useState<HabitCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadCheckIns = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      if (user && isBackendConfigured()) {
        const response = await authenticatedGet(`/api/check-ins/today`);
        setCheckIns(response.checkIns || []);
      } else {
        const stored = await AsyncStorage.getItem(CHECKINS_STORAGE_KEY);
        const allCheckIns: HabitCheckIn[] = stored ? JSON.parse(stored) : [];
        setCheckIns(allCheckIns.filter(c => c.date === today));
      }
    } catch (err) {
      console.error('Error loading check-ins:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCheckIns();
  }, [loadCheckIns]);

  return { checkIns, loading, refreshCheckIns: loadCheckIns };
};

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user && isBackendConfigured()) {
          const response = await authenticatedGet('/api/users/stats');
          setStats(response.stats);
        }
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  return { stats, loading };
};

export const useHabitCheckIns = (habitId: string) => {
  const [checkIns, setCheckIns] = useState<HabitCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadCheckIns = async () => {
      try {
        if (user && isBackendConfigured()) {
          const response = await authenticatedGet(`/api/check-ins/habit/${habitId}`);
          setCheckIns(response.checkIns || []);
        } else {
          const stored = await AsyncStorage.getItem(CHECKINS_STORAGE_KEY);
          const allCheckIns: HabitCheckIn[] = stored ? JSON.parse(stored) : [];
          setCheckIns(allCheckIns.filter(c => c.habitId === habitId));
        }
      } catch (err) {
        console.error('Error loading habit check-ins:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCheckIns();
  }, [habitId, user]);

  return { checkIns, loading };
};
