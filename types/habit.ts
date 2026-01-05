
export type HabitType = 'yes_no' | 'count' | 'duration';
export type HabitSchedule = 'daily' | 'specific_days' | 'x_per_week';
export type HabitTag = 'Health' | 'Fitness' | 'Mind' | 'Study' | 'Work' | 'Social' | 'Creative' | 'Finance' | 'Home' | 'Other';

export const HABIT_TAGS: HabitTag[] = ['Health', 'Fitness', 'Mind', 'Study', 'Work', 'Social', 'Creative', 'Finance', 'Home', 'Other'];

export const HABIT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

// Icon definitions with both iOS SF Symbols and Android Material Icons
export const HABIT_ICONS = [
  { ios: 'figure.walk', android: 'directions-walk' },
  { ios: 'book.fill', android: 'menu-book' },
  { ios: 'brain.head.profile', android: 'psychology' },
  { ios: 'heart.fill', android: 'favorite' },
  { ios: 'leaf.fill', android: 'eco' },
  { ios: 'flame.fill', android: 'local-fire-department' },
  { ios: 'drop.fill', android: 'water-drop' },
  { ios: 'moon.stars.fill', android: 'nightlight' },
  { ios: 'sun.max.fill', android: 'wb-sunny' },
  { ios: 'star.fill', android: 'star' },
  { ios: 'bolt.fill', android: 'bolt' },
  { ios: 'sparkles', android: 'auto-awesome' },
  { ios: 'trophy.fill', android: 'emoji-events' },
  { ios: 'dumbbell.fill', android: 'fitness-center' },
  { ios: 'checkmark.circle.fill', android: 'check-circle' },
];

export interface Habit {
  id: string;
  title: string;
  description?: string;
  type: HabitType;
  schedule: HabitSchedule;
  specificDays?: number[];
  timesPerWeek?: number;
  color: string;
  icon: string;
  customIconUrl?: string;
  tags: string[];
  customTags?: string[];
  targetValue?: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  consistencyPercent: number;
  habitStrength: number;
  reminderTime?: string;
  createdAt: string;
}

export interface HabitCheckIn {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  value?: number;
  note?: string;
  mood?: number;
  effort?: number;
  createdAt: string;
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalHabits: number;
  activeHabits: number;
  totalCheckIns: number;
  currentStreak?: number;
  currentWeekStreak: number;
  longestStreak?: number;
  consistency?: number;
  isPremium: boolean;
}

export interface Insights {
  mostConsistentDay?: string;
  bestTime?: string;
  weeklyTrend: 'improving' | 'stable' | 'declining';
  onTrackPercentage: number;
  weeklyReview: string;
}
