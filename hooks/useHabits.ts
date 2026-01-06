
import { useState, useEffect } from 'react';
import { Habit, HabitCheckIn, UserStats } from '@/types/habit';
import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete, BACKEND_URL, isBackendConfigured } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

// Storage keys for local habits (free users)
const LOCAL_HABITS_KEY = '@momentum_local_habits';
const LOCAL_CHECKINS_KEY = '@momentum_local_checkins';

// Log backend URL for debugging
console.log('[useHabits] Backend URL:', BACKEND_URL);
console.log('[useHabits] Backend configured:', isBackendConfigured());

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const isPremium = user?.isPremium || false;

  const fetchHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Premium users: fetch from backend
      if (user && isPremium && isBackendConfigured()) {
        console.log('[useHabits] Fetching habits from API for premium user...');
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const fetchPromise = authenticatedGet<any>('/api/habits');
        
        const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
        console.log('[useHabits] Habits response:', response);
        
        const habitsData = Array.isArray(response) ? response : response.habits || [];
        const transformedHabits: Habit[] = habitsData.map((h: any) => ({
          id: h.id,
          title: h.title,
          description: h.description || '',
          type: h.type || 'yes_no',
          schedule: h.schedule || 'daily',
          specificDays: h.specificDays,
          timesPerWeek: h.frequency,
          tags: h.tags || [],
          customTags: h.customTags || [],
          color: h.color || '#6366F1',
          icon: h.icon || 'fitness-center',
          reminderTime: h.reminderTime,
          createdAt: h.createdAt,
          currentStreak: h.currentStreak || 0,
          longestStreak: h.longestStreak || 0,
          totalCompletions: h.totalCompletions || 0,
          consistencyPercent: h.consistencyPercent || h.consistency || 0,
          habitStrength: h.habitStrength || h.strength || 0,
        }));
        
        setHabits(transformedHabits);
        console.log('[useHabits] Successfully loaded', transformedHabits.length, 'habits from backend');
      } else {
        // Free users: load from local storage
        console.log('[useHabits] Loading habits from local storage for free user...');
        const localHabitsJson = await AsyncStorage.getItem(LOCAL_HABITS_KEY);
        const localHabits = localHabitsJson ? JSON.parse(localHabitsJson) : [];
        setHabits(localHabits);
        console.log('[useHabits] Successfully loaded', localHabits.length, 'habits from local storage');
      }
    } catch (err: any) {
      console.log('[useHabits] Error fetching habits:', err.message);
      setError(err.message || 'Failed to load habits');
      setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [user?.id, isPremium]);

  const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'totalCompletions' | 'consistencyPercent' | 'habitStrength'>) => {
    try {
      // Premium users: save to backend
      if (user && isPremium && isBackendConfigured()) {
        console.log('[useHabits] Creating new habit on backend:', habit);
        
        const apiPayload = {
          title: habit.title,
          description: habit.description,
          type: habit.type,
          schedule: habit.schedule,
          frequency: habit.timesPerWeek,
          specificDays: habit.specificDays,
          tags: habit.tags,
          customTags: habit.customTags,
          color: habit.color,
          icon: habit.icon,
        };
        
        const response = await authenticatedPost<any>('/api/habits', apiPayload);
        console.log('[useHabits] Habit created on backend:', response);
        
        await fetchHabits();
      } else {
        // Free users: save to local storage
        console.log('[useHabits] Creating new habit locally:', habit);
        
        const newHabit: Habit = {
          ...habit,
          id: `local_${Date.now()}`,
          createdAt: new Date().toISOString(),
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
          consistencyPercent: 0,
          habitStrength: 0,
        };
        
        const updatedHabits = [...habits, newHabit];
        await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(updatedHabits));
        setHabits(updatedHabits);
        console.log('[useHabits] Habit created locally');
      }
    } catch (err: any) {
      console.error('[useHabits] Error creating habit:', err);
      throw new Error(err.message || 'Failed to create habit');
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      // Premium users: update on backend
      if (user && isPremium && isBackendConfigured()) {
        console.log('[useHabits] Updating habit on backend:', id, updates);
        
        const apiPayload: any = {};
        if (updates.title) apiPayload.title = updates.title;
        if (updates.description !== undefined) apiPayload.description = updates.description;
        if (updates.type) apiPayload.type = updates.type;
        if (updates.schedule) apiPayload.schedule = updates.schedule;
        if (updates.timesPerWeek) apiPayload.frequency = updates.timesPerWeek;
        if (updates.specificDays) apiPayload.specificDays = updates.specificDays;
        if (updates.tags) apiPayload.tags = updates.tags;
        if (updates.customTags !== undefined) apiPayload.customTags = updates.customTags;
        if (updates.color) apiPayload.color = updates.color;
        if (updates.icon) apiPayload.icon = updates.icon;
        
        const response = await authenticatedPut<any>(`/api/habits/${id}`, apiPayload);
        console.log('[useHabits] Habit updated on backend:', response);
        
        await fetchHabits();
      } else {
        // Free users: update in local storage
        console.log('[useHabits] Updating habit locally:', id, updates);
        
        const updatedHabits = habits.map(h => 
          h.id === id ? { ...h, ...updates } : h
        );
        await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(updatedHabits));
        setHabits(updatedHabits);
        console.log('[useHabits] Habit updated locally');
      }
    } catch (err: any) {
      console.error('[useHabits] Error updating habit:', err);
      throw new Error(err.message || 'Failed to update habit');
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      // Premium users: delete from backend
      if (user && isPremium && isBackendConfigured()) {
        console.log('[useHabits] Deleting habit from backend:', id);
        
        await authenticatedDelete(`/api/habits/${id}`);
        console.log('[useHabits] Habit deleted from backend');
        
        setHabits(habits.filter(h => h.id !== id));
      } else {
        // Free users: delete from local storage
        console.log('[useHabits] Deleting habit locally:', id);
        
        const updatedHabits = habits.filter(h => h.id !== id);
        await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(updatedHabits));
        setHabits(updatedHabits);
        console.log('[useHabits] Habit deleted locally');
      }
    } catch (err: any) {
      console.error('[useHabits] Error deleting habit:', err);
      throw new Error(err.message || 'Failed to delete habit');
    }
  };

  const checkInHabit = async (habitId: string, value?: number, note?: string, mood?: number, effort?: number) => {
    try {
      // Premium users: check in on backend
      if (user && isPremium && isBackendConfigured()) {
        console.log('[useHabits] Checking in habit on backend:', habitId);
        
        const apiPayload = {
          habitId,
          value: value || 1,
          date: new Date().toISOString(),
          note,
          mood,
          effort,
        };
        
        const response = await authenticatedPost<any>('/api/check-ins', apiPayload);
        console.log('[useHabits] Check-in recorded on backend:', response);
        
        await fetchHabits();
      } else {
        // Free users: check in locally
        console.log('[useHabits] Checking in habit locally:', habitId);
        
        // Load existing check-ins
        const checkInsJson = await AsyncStorage.getItem(LOCAL_CHECKINS_KEY);
        const checkIns = checkInsJson ? JSON.parse(checkInsJson) : [];
        
        // Add new check-in
        const newCheckIn = {
          id: `local_checkin_${Date.now()}`,
          habitId,
          date: new Date().toISOString(),
          completed: true,
          value: value || 1,
          note,
          mood,
          effort,
          createdAt: new Date().toISOString(),
        };
        
        checkIns.push(newCheckIn);
        await AsyncStorage.setItem(LOCAL_CHECKINS_KEY, JSON.stringify(checkIns));
        
        // Update habit stats locally
        const updatedHabits = habits.map(h => {
          if (h.id === habitId) {
            return {
              ...h,
              totalCompletions: (h.totalCompletions || 0) + 1,
              currentStreak: (h.currentStreak || 0) + 1,
              longestStreak: Math.max((h.longestStreak || 0), (h.currentStreak || 0) + 1),
            };
          }
          return h;
        });
        
        await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(updatedHabits));
        setHabits(updatedHabits);
        console.log('[useHabits] Check-in recorded locally');
      }
    } catch (err: any) {
      console.error('[useHabits] Error checking in habit:', err);
      throw new Error(err.message || 'Failed to record check-in');
    }
  };

  return {
    habits,
    loading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    checkInHabit,
    refreshHabits: fetchHabits,
  };
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalHabits: 0,
    activeHabits: 0,
    totalCheckIns: 0,
    currentWeekStreak: 0,
    isPremium: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const isPremium = user?.isPremium || false;

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Premium users: fetch from backend
      if (user && isPremium && isBackendConfigured()) {
        console.log('[useUserStats] Fetching user stats from API...');
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const fetchPromise = authenticatedGet<any>('/api/stats');
        
        const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
        console.log('[useUserStats] Stats response:', response);
        
        const statsData: UserStats = {
          level: response.level || 1,
          xp: response.xp || 0,
          xpToNextLevel: response.xpToNextLevel || 100,
          totalHabits: response.totalHabits || 0,
          activeHabits: response.activeHabits || 0,
          totalCheckIns: response.totalCheckIns || 0,
          currentWeekStreak: response.currentWeekStreak || response.currentStreak || 0,
          isPremium: response.isPremium || false,
          currentStreak: response.currentStreak || 0,
          consistency: response.consistency || 0,
        };
        
        setStats(statsData);
        console.log('[useUserStats] Successfully loaded stats from backend');
      } else {
        // Free users: calculate from local storage
        console.log('[useUserStats] Calculating stats from local storage...');
        
        const habitsJson = await AsyncStorage.getItem(LOCAL_HABITS_KEY);
        const habits = habitsJson ? JSON.parse(habitsJson) : [];
        
        const checkInsJson = await AsyncStorage.getItem(LOCAL_CHECKINS_KEY);
        const checkIns = checkInsJson ? JSON.parse(checkInsJson) : [];
        
        setStats({
          level: 1,
          xp: checkIns.length * 10,
          xpToNextLevel: 100,
          totalHabits: habits.length,
          activeHabits: habits.length,
          totalCheckIns: checkIns.length,
          currentWeekStreak: 0,
          isPremium: false,
        });
        console.log('[useUserStats] Successfully calculated local stats');
      }
    } catch (err: any) {
      console.log('[useUserStats] Error fetching stats:', err.message);
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id, isPremium]);

  return { stats, loading, error, refreshStats: fetchStats };
}

export function useHabitCheckIns(habitId: string, startDate?: string, endDate?: string) {
  const [checkIns, setCheckIns] = useState<HabitCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const isPremium = user?.isPremium || false;

  const fetchCheckIns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Premium users: fetch from backend
      if (user && isPremium && isBackendConfigured()) {
        console.log('[useHabitCheckIns] Fetching check-ins for habit:', habitId);
        
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const fetchPromise = authenticatedGet<any>(`/api/check-ins/habit/${habitId}${queryString}`);
        
        const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
        console.log('[useHabitCheckIns] Check-ins response:', response);
        
        const checkInsData = Array.isArray(response) ? response : response.checkIns || [];
        const transformedCheckIns: HabitCheckIn[] = checkInsData.map((c: any) => ({
          id: c.id,
          habitId: c.habitId,
          date: c.date,
          completed: c.completed !== false,
          value: c.value,
          note: c.note,
          mood: c.mood,
          effort: c.effort,
          createdAt: c.createdAt,
        }));
        
        setCheckIns(transformedCheckIns);
        console.log('[useHabitCheckIns] Successfully loaded', transformedCheckIns.length, 'check-ins from backend');
      } else {
        // Free users: load from local storage
        console.log('[useHabitCheckIns] Loading check-ins from local storage for habit:', habitId);
        
        const checkInsJson = await AsyncStorage.getItem(LOCAL_CHECKINS_KEY);
        const allCheckIns = checkInsJson ? JSON.parse(checkInsJson) : [];
        const habitCheckIns = allCheckIns.filter((c: any) => c.habitId === habitId);
        
        setCheckIns(habitCheckIns);
        console.log('[useHabitCheckIns] Successfully loaded', habitCheckIns.length, 'check-ins from local storage');
      }
    } catch (err: any) {
      console.log('[useHabitCheckIns] Error fetching check-ins:', err.message);
      setError(err.message || 'Failed to load check-ins');
      setCheckIns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (habitId) {
      fetchCheckIns();
    }
  }, [habitId, startDate, endDate, user?.id, isPremium]);

  return { checkIns, loading, error, refreshCheckIns: fetchCheckIns };
}

export function useTodayCheckIns() {
  const [checkIns, setCheckIns] = useState<HabitCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const isPremium = user?.isPremium || false;

  const fetchTodayCheckIns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Premium users: fetch from backend
      if (user && isPremium && isBackendConfigured()) {
        console.log('[useTodayCheckIns] Fetching today\'s check-ins from backend...');
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const fetchPromise = authenticatedGet<any>('/api/check-ins/today');
        
        const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
        console.log('[useTodayCheckIns] Today\'s check-ins response:', response);
        
        const checkInsData = Array.isArray(response) ? response : response.checkIns || [];
        const transformedCheckIns: HabitCheckIn[] = checkInsData.map((c: any) => ({
          id: c.id,
          habitId: c.habitId,
          date: c.date,
          completed: c.completed !== false,
          value: c.value,
          note: c.note,
          mood: c.mood,
          effort: c.effort,
          createdAt: c.createdAt,
        }));
        
        setCheckIns(transformedCheckIns);
        console.log('[useTodayCheckIns] Successfully loaded', transformedCheckIns.length, 'check-ins from backend');
      } else {
        // Free users: load from local storage
        console.log('[useTodayCheckIns] Loading today\'s check-ins from local storage...');
        
        const checkInsJson = await AsyncStorage.getItem(LOCAL_CHECKINS_KEY);
        const allCheckIns = checkInsJson ? JSON.parse(checkInsJson) : [];
        
        const today = new Date().toISOString().split('T')[0];
        const todayCheckIns = allCheckIns.filter((c: any) => 
          c.date.startsWith(today)
        );
        
        setCheckIns(todayCheckIns);
        console.log('[useTodayCheckIns] Successfully loaded', todayCheckIns.length, 'check-ins from local storage');
      }
    } catch (err: any) {
      console.log('[useTodayCheckIns] Error fetching today\'s check-ins:', err.message);
      setError(err.message || 'Failed to load today\'s check-ins');
      setCheckIns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayCheckIns();
  }, [user?.id, isPremium]);

  return { checkIns, loading, error, refreshCheckIns: fetchTodayCheckIns };
}
