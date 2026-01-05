import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth-schema.js';

// Enums
export const habitTypeEnum = pgEnum('habit_type', ['yes_no', 'count', 'duration']);

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
    type: habitTypeEnum('type').notNull().default('yes_no'),
    schedule: text('schedule'), // daily, weekly, custom
    frequency: integer('frequency'), // times per week/month
    tags: text('tags').array().default([]),
    customTags: text('custom_tags').array().default([]),
    icon: text('icon').default('circle'),
    color: text('color').default('#3b82f6'),
    streak: integer('streak').notNull().default(0),
    habitStrength: integer('habit_strength').notNull().default(100),
    consistencyPercent: integer('consistency_percent').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('habits_user_id_idx').on(table.userId),
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
    completedAt: timestamp('completed_at').notNull(),
    value: integer('value'), // for count/duration types
    note: text('note'),
    mood: integer('mood'), // 1-5
    effort: integer('effort'), // 1-5
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('check_ins_habit_id_idx').on(table.habitId),
    index('check_ins_user_id_idx').on(table.userId),
    index('check_ins_completed_at_idx').on(table.completedAt),
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
    currentStreak: integer('current_streak').notNull().default(0),
    longestStreak: integer('longest_streak').notNull().default(0),
    totalCheckIns: integer('total_check_ins').notNull().default(0),
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
