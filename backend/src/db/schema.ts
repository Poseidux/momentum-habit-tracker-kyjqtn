import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  jsonb,
  pgEnum,
  date,
  time,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth-schema.js';

// Enums
export const habitTypeEnum = pgEnum('habit_type', ['yes_no', 'count', 'duration']);
export const scheduleTypeEnum = pgEnum('schedule_type', ['daily', 'specific_days', 'times_per_week']);

// Habits table
export const habits = pgTable(
  'habits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    habitType: habitTypeEnum('habit_type').notNull().default('yes_no'),
    targetValue: integer('target_value'),
    scheduleType: scheduleTypeEnum('schedule_type').notNull().default('daily'),
    scheduleConfig: jsonb('schedule_config').$type<{
      daysOfWeek?: number[];
      timesPerWeek?: number;
    }>(),
    tags: text('tags').array().default([]),
    color: text('color').default('#3b82f6'),
    icon: text('icon').default('circle'),
    reminderTime: time('reminder_time'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('habits_user_id_idx').on(table.userId),
    index('habits_is_active_idx').on(table.isActive),
  ]
);

// Check-ins table
export const checkIns = pgTable(
  'check_ins',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    habitId: uuid('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    date: date('date', { mode: 'string' }).notNull(),
    value: integer('value').notNull(),
    note: text('note'),
    mood: integer('mood'),
    effort: integer('effort'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('check_ins_habit_id_idx').on(table.habitId),
    index('check_ins_user_id_idx').on(table.userId),
    index('check_ins_date_idx').on(table.date),
    uniqueIndex('check_ins_habit_date_unique').on(table.habitId, table.date),
  ]
);

// User stats table
export const userStats = pgTable(
  'user_stats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
      .unique(),
    totalXp: integer('total_xp').notNull().default(0),
    level: integer('level').notNull().default(1),
    currentStreak: integer('current_streak').notNull().default(0),
    longestStreak: integer('longest_streak').notNull().default(0),
    graceSkipsUsedThisWeek: integer('grace_skips_used_this_week').notNull().default(0),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('user_stats_user_id_idx').on(table.userId)]
);

// Relations
export const habitsRelations = relations(habits, ({ many, one }) => ({
  checkIns: many(checkIns),
  user: one(user, {
    fields: [habits.userId],
    references: [user.id],
  }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  habit: one(habits, {
    fields: [checkIns.habitId],
    references: [habits.id],
  }),
  user: one(user, {
    fields: [checkIns.userId],
    references: [user.id],
  }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(user, {
    fields: [userStats.userId],
    references: [user.id],
  }),
}));
