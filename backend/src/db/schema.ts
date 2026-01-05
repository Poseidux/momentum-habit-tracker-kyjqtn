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
export const groupMemberRoleEnum = pgEnum('group_member_role', ['admin', 'member']);

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

// Habit Groups table
export const habitGroups = pgTable(
  'habit_groups',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    maxMembers: integer('max_members').notNull().default(10),
    inviteCode: text('invite_code').unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('habit_groups_created_by_idx').on(table.createdBy),
    index('habit_groups_invite_code_idx').on(table.inviteCode),
  ]
);

// Habit Group Members table
export const habitGroupMembers = pgTable(
  'habit_group_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => habitGroups.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: groupMemberRoleEnum('role').notNull().default('member'),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => [
    index('habit_group_members_group_id_idx').on(table.groupId),
    index('habit_group_members_user_id_idx').on(table.userId),
    uniqueIndex('habit_group_members_unique').on(table.groupId, table.userId),
  ]
);

// Habit Group Challenges table
export const habitGroupChallenges = pgTable(
  'habit_group_challenges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => habitGroups.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    habitId: uuid('habit_id').references(() => habits.id, { onDelete: 'set null' }),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('habit_group_challenges_group_id_idx').on(table.groupId),
    index('habit_group_challenges_habit_id_idx').on(table.habitId),
  ]
);

// Themes table
export const themes = pgTable(
  'themes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    themeName: text('theme_name').notNull(),
    primaryColor: text('primary_color').notNull(),
    secondaryColor: text('secondary_color').notNull(),
    backgroundColor: text('background_color').notNull(),
    cardColor: text('card_color').notNull(),
    textColor: text('text_color').notNull(),
    isActive: boolean('is_active').notNull().default(false),
    isPreset: boolean('is_preset').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('themes_user_id_idx').on(table.userId),
    index('themes_is_preset_idx').on(table.isPreset),
  ]
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

export const habitGroupsRelations = relations(habitGroups, ({ one, many }) => ({
  creator: one(user, {
    fields: [habitGroups.createdBy],
    references: [user.id],
  }),
  members: many(habitGroupMembers),
  challenges: many(habitGroupChallenges),
}));

export const habitGroupMembersRelations = relations(habitGroupMembers, ({ one }) => ({
  group: one(habitGroups, {
    fields: [habitGroupMembers.groupId],
    references: [habitGroups.id],
  }),
  user: one(user, {
    fields: [habitGroupMembers.userId],
    references: [user.id],
  }),
}));

export const habitGroupChallengesRelations = relations(
  habitGroupChallenges,
  ({ one }) => ({
    group: one(habitGroups, {
      fields: [habitGroupChallenges.groupId],
      references: [habitGroups.id],
    }),
    habit: one(habits, {
      fields: [habitGroupChallenges.habitId],
      references: [habits.id],
    }),
  })
);

export const themesRelations = relations(themes, ({ one }) => ({
  user: one(user, {
    fields: [themes.userId],
    references: [user.id],
  }),
}));
