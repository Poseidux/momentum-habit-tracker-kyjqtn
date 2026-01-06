
export type HabitType = 'yesno' | 'count' | 'duration';
export type HabitSchedule = 'daily' | 'specific' | 'weekly';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  type: HabitType;
  schedule: HabitSchedule;
  specificDays?: number[]; // 0-6 for Sun-Sat
  weeklyTarget?: number; // For weekly schedule
  color: string;
  icon: string;
  tags: string[];
  reminderTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  value: number; // 1 for yes/no, count for count type, minutes for duration
  note?: string;
  mood?: number; // 1-5
  effort?: number; // 1-5
  createdAt: string;
}

export interface UserStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  badges: string[];
}

export const HABIT_COLORS = [
  '#6B4EFF', '#0EA5E9', '#059669', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6',
];

export const HABIT_ICONS = [
  'checkmark.circle', 'star', 'heart', 'bolt', 'flame', 'drop', 'leaf', 'moon',
  'sun.max', 'book', 'dumbbell', 'fork.knife', 'bed.double', 'brain.head.profile',
];

export const HABIT_TAGS = [
  'Health', 'Fitness', 'Mind', 'Study', 'Work', 'Social', 'Creative', 'Finance',
];
