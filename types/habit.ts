
export type HabitType = 'yes_no' | 'count' | 'duration';
export type HabitSchedule = 'daily' | 'weekly' | 'specific_days';

export interface HabitIcon {
  ios: string;
  android: string;
  emoji: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  type: HabitType;
  icon: HabitIcon;
  customIconUrl?: string;
  schedule: HabitSchedule;
  timesPerWeek?: number;
  days?: string[];
  reminderTime?: string;
  goal?: number;
  currentStreak?: number;
  tags?: string[];
  color?: string;
  createdAt?: string;
}

export interface HabitCheckIn {
  id: string;
  habitId: string;
  date: string;
  value?: number;
  duration?: number;
  note?: string;
  mood?: number;
  effort?: number;
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
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

export const HABIT_ICONS: HabitIcon[] = [
  { ios: 'figure.run', android: 'directions_run', emoji: '🏃' },
  { ios: 'book.fill', android: 'menu_book', emoji: '📚' },
  { ios: 'drop.fill', android: 'water_drop', emoji: '💧' },
  { ios: 'moon.zzz.fill', android: 'bedtime', emoji: '😴' },
  { ios: 'heart.fill', android: 'favorite', emoji: '❤️' },
  { ios: 'leaf.fill', android: 'eco', emoji: '🌱' },
  { ios: 'dumbbell.fill', android: 'fitness_center', emoji: '💪' },
  { ios: 'brain.head.profile', android: 'psychology', emoji: '🧠' },
];

export const HABIT_TAGS = [
  'Health', 'Fitness', 'Study', 'Work', 'Mind', 'Social', 'Creative', 'Finance'
];
