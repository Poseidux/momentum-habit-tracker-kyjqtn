
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, CheckIn } from '@/types/habit';
import { authenticatedGet, authenticatedPost, authenticatedDelete, isBackendConfigured } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

const HABITS_KEY = 'habits';
const CHECKINS_KEY = 'checkins';

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadHabits();
  }, [user]);

  const loadHabits = async () => {
    try {
      setLoading(true);
      if (user && isBackendConfigured()) {
        const response = await authenticatedGet('/api/habits');
        setHabits(response.habits || []);
      } else {
        const stored = await AsyncStorage.getItem(HABITS_KEY);
        setHabits(stored ? JSON.parse(stored) : []);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  const saveHabit = async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    try {
      if (user && isBackendConfigured()) {
        const response = await authenticatedPost('/api/habits', habit);
        await loadHabits();
        return response.habit;
      } else {
        const newHabit: Habit = {
          ...habit,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        const updated = [...habits, newHabit];
        await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
        setHabits(updated);
        return newHabit;
      }
    } catch (error) {
      console.error('Error saving habit:', error);
      throw error;
    }
  };

  const addHabit = saveHabit;

  const deleteHabit = async (habitId: string) => {
    try {
      if (user && isBackendConfigured()) {
        await authenticatedDelete(`/api/habits/${habitId}`);
        await loadHabits();
      } else {
        const updated = habits.filter(h => h.id !== habitId);
        await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
        setHabits(updated);
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  };

  return {
    habits,
    loading,
    saveHabit,
    addHabit,
    deleteHabit,
    refreshHabits: loadHabits,
  };
};

export const useTodayCheckIns = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadCheckIns();
  }, [user]);

  const loadCheckIns = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      if (user && isBackendConfigured()) {
        const response = await authenticatedGet(`/api/check-ins?date=${today}`);
        setCheckIns(response.checkIns || []);
      } else {
        const stored = await AsyncStorage.getItem(CHECKINS_KEY);
        const all: CheckIn[] = stored ? JSON.parse(stored) : [];
        setCheckIns(all.filter(c => c.date === today));
      }
    } catch (error) {
      console.error('Error loading check-ins:', error);
      setCheckIns([]);
    }
  };

  const checkIn = async (habitId: string, value?: number, note?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      if (user && isBackendConfigured()) {
        await authenticatedPost('/api/check-ins', { habitId, date: today, value, note });
        await loadCheckIns();
      } else {
        const stored = await AsyncStorage.getItem(CHECKINS_KEY);
        const all: CheckIn[] = stored ? JSON.parse(stored) : [];
        
        // Remove existing check-in for today if it exists
        const filtered = all.filter(c => !(c.habitId === habitId && c.date === today));
        
        const newCheckIn: CheckIn = {
          id: Date.now().toString(),
          habitId,
          date: today,
          value,
          note,
          createdAt: new Date().toISOString(),
        };
        const updated = [...filtered, newCheckIn];
        await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(updated));
        setCheckIns(updated.filter(c => c.date === today));
      }
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  };

  return {
    checkIns,
    checkIn,
    refreshCheckIns: loadCheckIns,
  };
};

export const useUserStats = () => {
  const [stats, setStats] = useState({ level: 1, xp: 0, nextLevelXp: 100, totalCheckIns: 0 });
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      if (user && isBackendConfigured()) {
        const response = await authenticatedGet('/api/stats');
        setStats(response.stats || stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return stats;
};
