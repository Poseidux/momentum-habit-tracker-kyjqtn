
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitCheckIn, UserStats } from '@/types/habit';
import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete, isBackendConfigured } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

const HABITS_STORAGE_KEY = '@momentum_habits';
const CHECKINS_STORAGE_KEY = '@momentum_checkins';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      
      if (user?.isPremium && isBackendConfigured()) {
        try {
          const response = await authenticatedGet('/api/habits', { timeout: 3000 });
          const apiHabits = response.map((h: any) => ({
            id: h.id,
            title: h.title,
            description: h.description,
            type: h.type,
            schedule: h.schedule,
            specificDays: h.specificDays ? JSON.parse(h.specificDays) : undefined,
            timesPerWeek: h.timesPerWeek,
            reminderTime: h.reminderTime,
            tags: h.tags ? JSON.parse(h.tags) : [],
            color: h.color,
            icon: h.icon,
            customIcon: h.customIcon,
            customIconUrl: h.customIconUrl,
            createdAt: h.createdAt,
            userId: h.userId,
            currentStreak: h.currentStreak || 0,
          }));
          setHabits(apiHabits);
        } catch (error) {
          console.log('[useHabits] Backend unavailable, using local storage');
          const localHabits = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
          setHabits(localHabits ? JSON.parse(localHabits) : []);
        }
      } else {
        const localHabits = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
        setHabits(localHabits ? JSON.parse(localHabits) : []);
      }
    } catch (error) {
      console.error('[useHabits] Error fetching habits:', error);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    try {
      const newHabit: Habit = {
        ...habit,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        currentStreak: 0,
      };

      if (user?.isPremium && isBackendConfigured()) {
        try {
          const payload = {
            title: newHabit.title,
            description: newHabit.description,
            type: newHabit.type,
            schedule: newHabit.schedule,
            specificDays: newHabit.specificDays ? JSON.stringify(newHabit.specificDays) : null,
            timesPerWeek: newHabit.timesPerWeek,
            reminderTime: newHabit.reminderTime,
            tags: JSON.stringify(newHabit.tags),
            color: newHabit.color,
            icon: newHabit.icon,
            customIcon: newHabit.customIcon,
            customIconUrl: newHabit.customIconUrl,
          };
          await authenticatedPost('/api/habits', payload, { timeout: 3000 });
          await fetchHabits();
        } catch (error) {
          console.log('[useHabits] Backend unavailable, saving locally');
          const updatedHabits = [...habits, newHabit];
          setHabits(updatedHabits);
          await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
        }
      } else {
        const updatedHabits = [...habits, newHabit];
        setHabits(updatedHabits);
        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
      }
    } catch (err: any) {
      console.error('[useHabits] Error creating habit:', err);
      throw new Error(err.message || 'Failed to create habit');
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      if (user?.isPremium && isBackendConfigured()) {
        try {
          const payload: any = {};
          if (updates.title) payload.title = updates.title;
          if (updates.description !== undefined) payload.description = updates.description;
          if (updates.type) payload.type = updates.type;
          if (updates.schedule) payload.schedule = updates.schedule;
          if (updates.specificDays !== undefined) payload.specificDays = JSON.stringify(updates.specificDays);
          if (updates.timesPerWeek !== undefined) payload.timesPerWeek = updates.timesPerWeek;
          if (updates.reminderTime !== undefined) payload.reminderTime = updates.reminderTime;
          if (updates.tags) payload.tags = JSON.stringify(updates.tags);
          if (updates.color) payload.color = updates.color;
          if (updates.icon) payload.icon = updates.icon;
          if (updates.customIcon !== undefined) payload.customIcon = updates.customIcon;
          if (updates.customIconUrl !== undefined) payload.customIconUrl = updates.customIconUrl;

          await authenticatedPut(`/api/habits/${id}`, payload, { timeout: 3000 });
          await fetchHabits();
        } catch (error) {
          console.log('[useHabits] Backend unavailable, updating locally');
          const updatedHabits = habits.map(h => h.id === id ? { ...h, ...updates } : h);
          setHabits(updatedHabits);
          await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
        }
      } else {
        const updatedHabits = habits.map(h => h.id === id ? { ...h, ...updates } : h);
        setHabits(updatedHabits);
        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
      }
    } catch (error) {
      console.error('[useHabits] Error updating habit:', error);
      throw error;
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      if (user?.isPremium && isBackendConfigured()) {
        try {
          await authenticatedDelete(`/api/habits/${id}`, { timeout: 3000 });
          await fetchHabits();
        } catch (error) {
          console.log('[useHabits] Backend unavailable, deleting locally');
          const updatedHabits = habits.filter(h => h.id !== id);
          setHabits(updatedHabits);
          await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
        }
      } else {
        const updatedHabits = habits.filter(h => h.id !== id);
        setHabits(updatedHabits);
        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
      }
    } catch (error) {
      console.error('[useHabits] Error deleting habit:', error);
      throw error;
    }
  };

  const checkInHabit = async (habitId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const checkIn: HabitCheckIn = {
        id: Date.now().toString(),
        habitId,
        date: today,
        value: true,
        createdAt: new Date().toISOString(),
      };

      if (user?.isPremium && isBackendConfigured()) {
        try {
          await authenticatedPost('/api/check-ins', {
            habitId,
            date: today,
            value: 1,
          }, { timeout: 3000 });
          await fetchHabits();
        } catch (error) {
          console.log('[useHabits] Backend unavailable, saving check-in locally');
          const localCheckIns = await AsyncStorage.getItem(CHECKINS_STORAGE_KEY);
          const allCheckIns: HabitCheckIn[] = localCheckIns ? JSON.parse(localCheckIns) : [];
          allCheckIns.push(checkIn);
          await AsyncStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(allCheckIns));
        }
      } else {
        const localCheckIns = await AsyncStorage.getItem(CHECKINS_STORAGE_KEY);
        const allCheckIns: HabitCheckIn[] = localCheckIns ? JSON.parse(localCheckIns) : [];
        allCheckIns.push(checkIn);
        await AsyncStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(allCheckIns));
      }
    } catch (error) {
      console.error('[useHabits] Error checking in habit:', error);
      throw error;
    }
  };

  return { 
    habits, 
    loading, 
    addHabit, 
    updateHabit, 
    deleteHabit, 
    refetch: fetchHabits,
    refreshHabits: fetchHabits,
    checkInHabit,
  };
}

export function useTodayCheckIns() {
  const [checkIns, setCheckIns] = useState<HabitCheckIn[]>([]);
  const { user } = useAuth();

  const fetchCheckIns = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (user?.isPremium && isBackendConfigured()) {
        try {
          const response = await authenticatedGet(`/api/check-ins?date=${today}`, { timeout: 2000 });
          setCheckIns(response);
        } catch (error) {
          const localCheckIns = await AsyncStorage.getItem(CHECKINS_STORAGE_KEY);
          const allCheckIns: HabitCheckIn[] = localCheckIns ? JSON.parse(localCheckIns) : [];
          setCheckIns(allCheckIns.filter(c => c.date === today));
        }
      } else {
        const localCheckIns = await AsyncStorage.getItem(CHECKINS_STORAGE_KEY);
        const allCheckIns: HabitCheckIn[] = localCheckIns ? JSON.parse(localCheckIns) : [];
        setCheckIns(allCheckIns.filter(c => c.date === today));
      }
    } catch (error) {
      console.error('[useTodayCheckIns] Error:', error);
      setCheckIns([]);
    }
  }, [user]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  const addCheckIn = async (habitId: string, value: number | boolean, note?: string, mood?: number, effort?: number) => {
    try {
      const checkIn: HabitCheckIn = {
        id: Date.now().toString(),
        habitId,
        date: new Date().toISOString().split('T')[0],
        value,
        note,
        mood,
        effort,
        createdAt: new Date().toISOString(),
      };

      if (user?.isPremium && isBackendConfigured()) {
        try {
          await authenticatedPost('/api/check-ins', {
            habitId,
            date: checkIn.date,
            value: typeof value === 'boolean' ? (value ? 1 : 0) : value,
            note,
            mood,
            effort,
          }, { timeout: 3000 });
          await fetchCheckIns();
        } catch (error) {
          const localCheckIns = await AsyncStorage.getItem(CHECKINS_STORAGE_KEY);
          const allCheckIns: HabitCheckIn[] = localCheckIns ? JSON.parse(localCheckIns) : [];
          allCheckIns.push(checkIn);
          await AsyncStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(allCheckIns));
          setCheckIns(prev => [...prev, checkIn]);
        }
      } else {
        const localCheckIns = await AsyncStorage.getItem(CHECKINS_STORAGE_KEY);
        const allCheckIns: HabitCheckIn[] = localCheckIns ? JSON.parse(localCheckIns) : [];
        allCheckIns.push(checkIn);
        await AsyncStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(allCheckIns));
        setCheckIns(prev => [...prev, checkIn]);
      }
    } catch (error) {
      console.error('[useTodayCheckIns] Error adding check-in:', error);
      throw error;
    }
  };

  return { 
    checkIns, 
    addCheckIn, 
    refetch: fetchCheckIns,
    refreshCheckIns: fetchCheckIns,
  };
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    consistency: 0,
    habitStrength: 0,
    totalCheckIns: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.isPremium && isBackendConfigured()) {
        try {
          const response = await authenticatedGet('/api/user/stats', { timeout: 2000 });
          setStats(response);
        } catch (error) {
          console.log('[useUserStats] Backend unavailable');
        }
      }
    };
    fetchStats();
  }, [user]);

  return stats;
}

export function useHabitCheckIns(habitId: string) {
  const [checkIns, setCheckIns] = useState<HabitCheckIn[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        if (user?.isPremium && isBackendConfigured()) {
          try {
            const response = await authenticatedGet(`/api/check-ins?habitId=${habitId}`, { timeout: 2000 });
            setCheckIns(response);
          } catch (error) {
            const localCheckIns = await AsyncStorage.getItem(CHECKINS_STORAGE_KEY);
            const allCheckIns: HabitCheckIn[] = localCheckIns ? JSON.parse(localCheckIns) : [];
            setCheckIns(allCheckIns.filter(c => c.habitId === habitId));
          }
        } else {
          const localCheckIns = await AsyncStorage.getItem(CHECKINS_STORAGE_KEY);
          const allCheckIns: HabitCheckIn[] = localCheckIns ? JSON.parse(localCheckIns) : [];
          setCheckIns(allCheckIns.filter(c => c.habitId === habitId));
        }
      } catch (error) {
        console.error('[useHabitCheckIns] Error:', error);
        setCheckIns([]);
      }
    };
    fetchCheckIns();
  }, [habitId, user]);

  return checkIns;
}
