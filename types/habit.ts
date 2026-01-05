
export type HabitType = 'yes_no' | 'count' | 'duration';
export type HabitSchedule = 'daily' | 'specific_days' | 'x_per_week';
export type HabitTag = 'Health' | 'Study' | 'Mind' | 'Fitness' | 'Work' | 'Social' | 'Creative' | 'Finance';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  type: HabitType;
  schedule: HabitSchedule;
  specificDays?: number[]; // 0-6 for Sunday-Saturday
  timesPerWeek?: number;
  tags: HabitTag[];
  customTags?: string[]; // Premium feature: custom user-defined tags
  color: string;
  icon: string;
  reminderTime?: string;
  createdAt: string;
  
  // Progress tracking
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  consistencyPercent: number;
  habitStrength: number; // 0-100
}

export interface HabitCheckIn {
  id: string;
  habitId: string;
  date: string; // ISO date string
  completed: boolean;
  value?: number; // For count/duration types
  note?: string;
  mood?: number; // 1-5
  effort?: number; // 1-5
  createdAt: string;
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalHabits: number;
  activeHabits: number;
  totalCheckIns: number;
  currentWeekStreak: number;
  currentStreak?: number; // Overall current streak
  consistency?: number; // Overall consistency percentage
  isPremium?: boolean; // Premium status
}

export const HABIT_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#A855F7',
];

// Material Design Icons - verified names that work on Android/web
export const HABIT_ICONS = [
  'fitness-center',
  'local-library',
  'self-improvement',
  'restaurant',
  'bedtime',
  'directions-run',
  'water-drop',
  'psychology',
  'work',
  'brush',
  'music-note',
  'savings',
  'favorite',
  'spa',
  'emoji-events',
  'lightbulb',
  'coffee',
  'pets',
  'park',
  'beach-access',
];

export const HABIT_TAGS: HabitTag[] = [
  'Health', 'Study', 'Mind', 'Fitness', 'Work', 'Social', 'Creative', 'Finance'
];
