
export type HabitType = 'yes_no' | 'count' | 'duration';
export type HabitSchedule = 'daily' | 'specific_days' | 'x_per_week';

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  schedule: HabitSchedule;
  specificDays?: number[]; // 0-6 for Sun-Sat
  timesPerWeek?: number;
  icon: string;
  color: string;
  tags: string[];
  reminderTime?: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  createdAt: string;
  userId?: string;
}

export interface CheckIn {
  id: string;
  habitId: string;
  date: string;
  value?: number;
  note?: string;
  mood?: number;
  effort?: number;
  createdAt: string;
  userId?: string;
}

export const HABIT_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#3B82F6',
];

export const HABIT_ICONS = [
  'fitness', 'book', 'water-drop', 'restaurant',
  'self-improvement', 'bedtime', 'psychology', 'work',
  'music-note', 'palette', 'code', 'language',
];

export const HABIT_TAGS = [
  'Health', 'Fitness', 'Study', 'Work',
  'Mindfulness', 'Creativity', 'Social', 'Finance',
];
