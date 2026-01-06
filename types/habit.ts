
export type HabitType = 'yes_no' | 'count' | 'duration';

export type HabitSchedule = 'daily' | 'specific_days' | 'x_per_week';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  type: HabitType;
  schedule: HabitSchedule;
  scheduleDays?: number[]; // 0-6 for specific days
  scheduleCount?: number; // for x_per_week
  tags: string[];
  color: string;
  icon: string | { ios: string; android: string };
  customIcon?: string;
  reminderTime?: string;
  createdAt: string;
  streak: number;
  currentStreak: number;
  longestStreak: number;
  consistency: number;
  habitStrength: number;
}

export interface HabitCheckIn {
  id: string;
  habitId: string;
  date: string;
  value: number | boolean;
  note?: string;
  mood?: number;
  effort?: number;
}

export interface UserStats {
  totalHabits: number;
  totalCheckIns: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  xp: number;
  badges: string[];
}

export const HABIT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

export const HABIT_ICONS = [
  'checkmark.circle', 'star', 'heart', 'flame', 'bolt',
  'leaf', 'drop', 'moon', 'sun.max', 'figure.walk'
];

export const HABIT_TAGS = [
  'Health', 'Fitness', 'Study', 'Work', 'Mindfulness',
  'Social', 'Creative', 'Finance', 'Home', 'Personal'
];
