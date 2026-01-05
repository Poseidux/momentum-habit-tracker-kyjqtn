
import { useState, useEffect } from 'react';
import { Habit, HabitCheckIn, UserStats } from '@/types/habit';
import { authenticatedGet, authenticatedPost, authenticatedPut, authenticatedDelete, BACKEND_URL, isBackendConfigured } from '@/utils/api';

// Log backend URL for debugging
console.log('[useHabits] Backend URL:', BACKEND_URL);
console.log('[useHabits] Backend configured:', isBackendConfigured());

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If backend is not configured, use empty state
      if (!isBackendConfigured()) {
        console.log('[useHabits] Backend not configured - using empty state');
        setHabits([]);
        setLoading(false);
        return;
      }
      
      console.log('[useHabits] Fetching habits from API...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const fetchPromise = authenticatedGet<any>('/api/habits');
      
      const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
      console.log('[useHabits] Habits response:', response);
      
      // Transform API response to match our Habit type
      const habitsData = Array.isArray(response) ? response : response.habits || [];
      const transformedHabits: Habit[] = habitsData.map((h: any) => ({
        id: h.id,
        title: h.title,
        description: h.description || '',
        type: h.habitType || h.type || 'yes_no',
        schedule: h.scheduleType || h.schedule || 'daily',
        specificDays: h.scheduleConfig?.specificDays,
        timesPerWeek: h.scheduleConfig?.timesPerWeek,
        tags: h.tags || [],
        color: h.color || '#6366F1',
        icon: h.icon || 'fitness-center',
        reminderTime: h.reminderTime,
        createdAt: h.createdAt,
        currentStreak: h.currentStreak || 0,
        longestStreak: h.longestStreak || 0,
        totalCompletions: h.totalCompletions || 0,
        consistencyPercent: h.consistencyPercent || 0,
        habitStrength: h.habitStrength || 0,
      }));
      
      setHabits(transformedHabits);
      console.log('[useHabits] Successfully loaded', transformedHabits.length, 'habits');
    } catch (err: any) {
      console.log('[useHabits] Error fetching habits (using empty state):', err.message);
      setError(err.message || 'Failed to load habits');
      setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'totalCompletions' | 'consistencyPercent' | 'habitStrength'>) => {
    try {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please rebuild the app.');
      }
      
      console.log('[useHabits] Creating new habit:', habit);
      
      // Transform to API format
      const apiPayload = {
        title: habit.title,
        description: habit.description,
        habitType: habit.type,
        targetValue: habit.type === 'yes_no' ? 1 : undefined,
        scheduleType: habit.schedule,
        scheduleConfig: {
          specificDays: habit.specificDays,
          timesPerWeek: habit.timesPerWeek,
        },
        tags: habit.tags,
        color: habit.color,
        icon: habit.icon,
        reminderTime: habit.reminderTime,
      };
      
      const response = await authenticatedPost<any>('/api/habits', apiPayload);
      console.log('[useHabits] Habit created:', response);
      
      // Refresh habits list
      await fetchHabits();
    } catch (err: any) {
      console.error('[useHabits] Error creating habit:', err);
      throw new Error(err.message || 'Failed to create habit');
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please rebuild the app.');
      }
      
      console.log('[useHabits] Updating habit:', id, updates);
      
      // Transform to API format
      const apiPayload: any = {};
      if (updates.title) apiPayload.title = updates.title;
      if (updates.description !== undefined) apiPayload.description = updates.description;
      if (updates.type) apiPayload.habitType = updates.type;
      if (updates.schedule) apiPayload.scheduleType = updates.schedule;
      if (updates.specificDays || updates.timesPerWeek) {
        apiPayload.scheduleConfig = {
          specificDays: updates.specificDays,
          timesPerWeek: updates.timesPerWeek,
        };
      }
      if (updates.tags) apiPayload.tags = updates.tags;
      if (updates.color) apiPayload.color = updates.color;
      if (updates.icon) apiPayload.icon = updates.icon;
      if (updates.reminderTime !== undefined) apiPayload.reminderTime = updates.reminderTime;
      
      const response = await authenticatedPut<any>(`/api/habits/${id}`, apiPayload);
      console.log('[useHabits] Habit updated:', response);
      
      // Refresh habits list
      await fetchHabits();
    } catch (err: any) {
      console.error('[useHabits] Error updating habit:', err);
      throw new Error(err.message || 'Failed to update habit');
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please rebuild the app.');
      }
      
      console.log('[useHabits] Deleting habit:', id);
      
      await authenticatedDelete(`/api/habits/${id}`);
      console.log('[useHabits] Habit deleted successfully');
      
      // Remove from local state immediately
      setHabits(habits.filter(h => h.id !== id));
    } catch (err: any) {
      console.error('[useHabits] Error deleting habit:', err);
      throw new Error(err.message || 'Failed to delete habit');
    }
  };

  const checkInHabit = async (habitId: string, value?: number, note?: string, mood?: number, effort?: number) => {
    try {
      if (!isBackendConfigured()) {
        throw new Error('Backend not configured. Please rebuild the app.');
      }
      
      console.log('[useHabits] Checking in habit:', habitId);
      
      const apiPayload = {
        habitId,
        value: value || 1,
        date: new Date().toISOString(),
        note,
        mood,
        effort,
      };
      
      const response = await authenticatedPost<any>('/api/check-ins', apiPayload);
      console.log('[useHabits] Check-in recorded:', response);
      
      // Refresh habits to get updated stats
      await fetchHabits();
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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If backend is not configured, use default stats
      if (!isBackendConfigured()) {
        console.log('[useUserStats] Backend not configured - using default stats');
        setStats({
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          totalHabits: 0,
          activeHabits: 0,
          totalCheckIns: 0,
          currentWeekStreak: 0,
        });
        setLoading(false);
        return;
      }
      
      console.log('[useUserStats] Fetching user stats from API...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const fetchPromise = authenticatedGet<any>('/api/stats/overview');
      
      const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
      console.log('[useUserStats] Stats response:', response);
      
      // Transform API response to match our UserStats type
      const statsData: UserStats = {
        level: response.level || 1,
        xp: response.xp || 0,
        xpToNextLevel: response.xpToNextLevel || 100,
        totalHabits: response.totalHabits || 0,
        activeHabits: response.activeHabits || 0,
        totalCheckIns: response.totalCheckIns || 0,
        currentWeekStreak: response.currentWeekStreak || 0,
      };
      
      setStats(statsData);
      console.log('[useUserStats] Successfully loaded stats');
    } catch (err: any) {
      console.log('[useUserStats] Error fetching stats (using default stats):', err.message);
      setError(err.message || 'Failed to load stats');
      // Keep default stats on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refreshStats: fetchStats };
}

export function useHabitCheckIns(habitId: string, startDate?: string, endDate?: string) {
  const [checkIns, setCheckIns] = useState<HabitCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckIns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isBackendConfigured()) {
        console.log('[useHabitCheckIns] Backend not configured - using empty state');
        setCheckIns([]);
        setLoading(false);
        return;
      }
      
      console.log('[useHabitCheckIns] Fetching check-ins for habit:', habitId);
      
      // Build query params
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const fetchPromise = authenticatedGet<any>(`/api/check-ins/habit/${habitId}${queryString}`);
      
      const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
      console.log('[useHabitCheckIns] Check-ins response:', response);
      
      // Transform API response to match our HabitCheckIn type
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
      console.log('[useHabitCheckIns] Successfully loaded', transformedCheckIns.length, 'check-ins');
    } catch (err: any) {
      console.log('[useHabitCheckIns] Error fetching check-ins (using empty state):', err.message);
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
  }, [habitId, startDate, endDate]);

  return { checkIns, loading, error, refreshCheckIns: fetchCheckIns };
}

/**
 * Hook to get today's check-ins across all habits
 */
export function useTodayCheckIns() {
  const [checkIns, setCheckIns] = useState<HabitCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayCheckIns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isBackendConfigured()) {
        console.log('[useTodayCheckIns] Backend not configured - using empty state');
        setCheckIns([]);
        setLoading(false);
        return;
      }
      
      console.log('[useTodayCheckIns] Fetching today\'s check-ins...');
      
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const fetchPromise = authenticatedGet<any>('/api/check-ins/today');
      
      const response = await Promise.race([fetchPromise, timeoutPromise]) as any;
      console.log('[useTodayCheckIns] Today\'s check-ins response:', response);
      
      // Transform API response
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
      console.log('[useTodayCheckIns] Successfully loaded', transformedCheckIns.length, 'check-ins');
    } catch (err: any) {
      console.log('[useTodayCheckIns] Error fetching today\'s check-ins (using empty state):', err.message);
      setError(err.message || 'Failed to load today\'s check-ins');
      setCheckIns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayCheckIns();
  }, []);

  return { checkIns, loading, error, refreshCheckIns: fetchTodayCheckIns };
}
