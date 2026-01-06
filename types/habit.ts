
export type HabitType = 'yes_no' | 'count' | 'duration';
export type HabitSchedule = 'daily' | 'specific_days' | 'x_per_week';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  type: HabitType;
  schedule: HabitSchedule;
  specificDays?: number[]; // 0-6 for Sun-Sat
  timesPerWeek?: number;
  reminderTime?: string;
  tags: string[];
  color: string;
  icon: string;
  customIcon?: string;
  customIconUrl?: string;
  createdAt: string;
  userId?: string;
  currentStreak?: number;
}

export interface HabitCheckIn {
  id: string;
  habitId: string;
  date: string;
  value: number | boolean;
  note?: string;
  mood?: number;
  effort?: number;
  createdAt: string;
}

export interface UserStats {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  consistency: number;
  habitStrength: number;
  totalCheckIns: number;
}

export const HABIT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

export interface HabitIcon {
  ios: string;
  android: string;
  emoji: string;
}

export const HABIT_ICONS: HabitIcon[] = [
  { ios: 'flame.fill', android: 'local-fire-department', emoji: '🔥' },
  { ios: 'heart.fill', android: 'favorite', emoji: '❤️' },
  { ios: 'star.fill', android: 'star', emoji: '⭐' },
  { ios: 'bolt.fill', android: 'bolt', emoji: '⚡' },
  { ios: 'leaf.fill', android: 'eco', emoji: '🍃' },
  { ios: 'drop.fill', android: 'water-drop', emoji: '💧' },
  { ios: 'moon.fill', android: 'nightlight', emoji: '🌙' },
  { ios: 'sun.max.fill', android: 'wb-sunny', emoji: '☀️' },
  { ios: 'sparkles', android: 'auto-awesome', emoji: '✨' },
  { ios: 'book.fill', android: 'menu-book', emoji: '📚' },
];

export const HABIT_TAGS = [
  'Health', 'Fitness', 'Mind', 'Study', 'Work', 'Social', 'Creative', 'Finance'
];
