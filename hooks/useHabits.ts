
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, CheckIn } from '@/types/habit';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedGet, authenticatedPost, isBackendConfigured } from '@/utils/api';

const HABITS_KEY = 'momentum_habits';
const CHECKINS_KEY = 'momentum_checkins';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadLocalHabits = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(HABITS_KEY);
      if (stored) {
        setHabits(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading local habits:', error);
    }
  }, []);

  const refreshHabits = useCallback(async () => {
    try {
      setLoading(true);
      
      // TODO: Backend Integration - Fetch habits from the backend API
      if (user && isBackendConfigured()) {
        const response = await authenticatedGet('/api/habits');
        if (response.ok) {
          const data = await response.json();
          setHabits(data.habits || []);
          await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(data.habits || []));
        } else {
          await loadLocalHabits();
        }
      } else {
        await loadLocalHabits();
      }
    } catch (error) {
      console.error('Error refreshing habits:', error);
      await loadLocalHabits();
    } finally {
      setLoading(false);
    }
  }, [user, loadLocalHabits]);

  useEffect(() => {
    refreshHabits();
  }, [refreshHabits]);

  const saveHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'totalCheckIns'>) => {
    try {
      const newHabit: Habit = {
        ...habit,
        id: Date.now().toString(),
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        createdAt: new Date().toISOString(),
        userId: user?.id,
      };

      // TODO: Backend Integration - Save habit to the backend API
      if (user && isBackendConfigured()) {
        const response = await authenticatedPost('/api/habits', newHabit);
        if (response.ok) {
          const data = await response.json();
          const updatedHabits = [...habits, data.habit];
          setHabits(updatedHabits);
          await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits));
          return;
        }
      }

      const updatedHabits = [...habits, newHabit];
      setHabits(updatedHabits);
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits));
    } catch (error) {
      console.error('Error saving habit:', error);
      throw error;
    }
  };

  const checkInHabit = async (habitId: string, value?: number, note?: string) => {
    try {
      const checkIn: CheckIn = {
        id: Date.now().toString(),
        habitId,
        date: new Date().toISOString().split('T')[0],
        value,
        note,
        createdAt: new Date().toISOString(),
        userId: user?.id,
      };

      // TODO: Backend Integration - Submit check-in to the backend API
      if (user && isBackendConfigured()) {
        const response = await authenticatedPost('/api/check-ins', checkIn);
        if (response.ok) {
          await refreshHabits();
          return;
        }
      }

      const updatedHabits = habits.map(h => {
        if (h.id === habitId) {
          return {
            ...h,
            currentStreak: h.currentStreak + 1,
            longestStreak: Math.max(h.longestStreak, h.currentStreak + 1),
            totalCheckIns: h.totalCheckIns + 1,
          };
        }
        return h;
      });

      setHabits(updatedHabits);
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits));

      const stored = await AsyncStorage.getItem(CHECKINS_KEY);
      const checkIns = stored ? JSON.parse(stored) : [];
      checkIns.push(checkIn);
      await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns));
      
      // Update last check-in date
      await AsyncStorage.setItem('last_check_in_date', new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error checking in habit:', error);
      throw error;
    }
  };

  return {
    habits,
    loading,
    refreshHabits,
    saveHabit,
    addHabit: saveHabit,
    checkInHabit,
  };
}

export function useTodayCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const { user } = useAuth();

  const refreshCheckIns = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // TODO: Backend Integration - Fetch today's check-ins from the backend API
      if (user && isBackendConfigured()) {
        const response = await authenticatedGet(`/api/check-ins?date=${today}`);
        if (response.ok) {
          const data = await response.json();
          setCheckIns(data.checkIns || []);
          return;
        }
      }

      const stored = await AsyncStorage.getItem(CHECKINS_KEY);
      if (stored) {
        const allCheckIns: CheckIn[] = JSON.parse(stored);
        const todayCheckIns = allCheckIns.filter(c => c.date === today);
        setCheckIns(todayCheckIns);
      }
    } catch (error) {
      console.error('Error refreshing check-ins:', error);
    }
  }, [user]);

  useEffect(() => {
    refreshCheckIns();
  }, [refreshCheckIns]);

  return { checkIns, refreshCheckIns };
}

export function useUserStats() {
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    totalHabits: 0,
    xp: 0,
  });
  const { user } = useAuth();

  const refreshStats = useCallback(async () => {
    try {
      // TODO: Backend Integration - Fetch user stats from the backend API
      if (user && isBackendConfigured()) {
        const response = await authenticatedGet('/api/user/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats || {
            totalXP: 0,
            level: 1,
            currentStreak: 0,
            totalHabits: 0,
            xp: 0,
          });
          return;
        }
      }

      // Load local stats
      const xpStored = await AsyncStorage.getItem('user_xp');
      const xp = xpStored ? parseInt(xpStored, 10) : 0;
      const level = Math.floor(xp / 100) + 1;

      setStats({
        totalXP: xp,
        level,
        currentStreak: 0,
        totalHabits: 0,
        xp,
      });
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }, [user]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return { stats, refreshStats };
}
