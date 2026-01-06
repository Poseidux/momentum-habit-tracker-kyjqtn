
export type HabitType = 'yes_no' | 'count' | 'duration';
export type HabitSchedule = 'daily' | 'specific_days' | 'x_per_week';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  type: HabitType;
  schedule: HabitSchedule;
  scheduleDays?: number[];
  scheduleCount?: number;
  icon?: string;
  customIcon?: string;
  color: string;
  tags: string[];
  reminderTime?: string;
  createdAt: string;
  streak?: number;
  strength?: number;
  totalCheckIns?: number;
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
}

export const HABIT_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#3B82F6',
];

export const HABIT_ICONS = [
  'checkmark.circle', 'star', 'heart', 'flame',
  'bolt', 'leaf', 'drop', 'moon',
  'sun.max', 'book', 'dumbbell', 'fork.knife',
];

export const HABIT_TAGS = [
  'Health', 'Fitness', 'Mind', 'Study',
  'Work', 'Social', 'Creative', 'Finance',
];
