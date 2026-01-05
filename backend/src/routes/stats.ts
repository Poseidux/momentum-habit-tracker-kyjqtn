import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc, gte, count, sql } from 'drizzle-orm';
import type { App } from '../index.js';
import * as schema from '../db/schema.js';

function getDateString(date: Date | string): string {
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return getDateString(d);
}

function calculateConsistency(completed: number, expected: number): number {
  if (expected === 0) return 100;
  return Math.round((completed / expected) * 100);
}

function calculateHabitStrength(completed: number, missed: number): number {
  let strength = 100;
  strength -= missed * 5; // Decrease by 5% per missed day
  strength += completed * 2; // Increase by 2% per completed day
  return Math.max(0, Math.min(100, strength)); // Clamp between 0-100
}

async function getExpectedCheckInsForDateRange(
  db: any,
  habitId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const habit = await db.query.habits.findFirst({
    where: eq(schema.habits.id, habitId),
  });

  if (!habit) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  switch (habit.scheduleType) {
    case 'daily':
      return daysDiff;
    case 'times_per_week':
      const weeks = Math.ceil(daysDiff / 7);
      return weeks * (habit.scheduleConfig?.timesPerWeek || 1);
    case 'specific_days':
      const daysOfWeek = habit.scheduleConfig?.daysOfWeek || [];
      let count = 0;
      for (let i = 0; i < daysDiff; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        if (daysOfWeek.includes(d.getDay())) count++;
      }
      return count;
    default:
      return daysDiff;
  }
}

export function registerStatsRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/stats/overview - Get user stats
  app.fastify.get(
    '/api/stats/overview',
    {
      schema: {
        description: 'Get user stats overview',
        tags: ['stats'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      let stats = await app.db.query.userStats.findFirst({
        where: eq(schema.userStats.userId, session.user.id),
      });

      if (!stats) {
        [stats] = await app.db
          .insert(schema.userStats)
          .values({
            userId: session.user.id,
            totalXp: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            graceSkipsUsedThisWeek: 0,
          })
          .returning();
      }

      // Get all active habits and calculate their streaks
      const habits = await app.db.query.habits.findMany({
        where: and(eq(schema.habits.userId, session.user.id), eq(schema.habits.isActive, true)),
      });

      const habitStreaks = await Promise.all(
        habits.map(async (habit) => {
          const checkIns = await app.db
            .select()
            .from(schema.checkIns)
            .where(eq(schema.checkIns.habitId, habit.id))
            .orderBy(desc(schema.checkIns.date));

          let currentStreak = 0;
          let lastProcessedDate: Date | null = null;

          for (const checkIn of checkIns) {
            const checkInDate = new Date(checkIn.date);
            checkInDate.setUTCHours(0, 0, 0, 0);

            if (lastProcessedDate === null) {
              lastProcessedDate = new Date();
              lastProcessedDate.setUTCHours(0, 0, 0, 0);
            }

            const expectedDate = new Date(lastProcessedDate);
            expectedDate.setDate(expectedDate.getDate() - 1);

            if (checkInDate.getTime() === lastProcessedDate.getTime()) {
              currentStreak++;
              lastProcessedDate = expectedDate;
            } else if (checkInDate.getTime() < lastProcessedDate.getTime()) {
              break;
            }
          }

          return {
            habitId: habit.id,
            habitTitle: habit.title,
            currentStreak,
          };
        })
      );

      return {
        totalXp: stats.totalXp,
        level: stats.level,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        habits: habitStreaks,
      };
    }
  );

  // GET /api/stats/habit/:habitId - Get detailed stats for a specific habit
  app.fastify.get(
    '/api/stats/habit/:habitId',
    {
      schema: {
        description: 'Get detailed stats for a specific habit',
        tags: ['stats'],
        params: {
          type: 'object',
          required: ['habitId'],
          properties: { habitId: { type: 'string' } },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { habitId } = request.params as { habitId: string };

      const habit = await app.db.query.habits.findFirst({
        where: and(eq(schema.habits.id, habitId), eq(schema.habits.userId, session.user.id)),
      });

      if (!habit) {
        return reply.code(404).send({ message: 'Habit not found' });
      }

      const today = getDateString(new Date());
      const thirtyDaysAgo = daysAgo(29);

      // Get check-ins for the last 30 days
      const checkIns = await app.db
        .select()
        .from(schema.checkIns)
        .where(and(eq(schema.checkIns.habitId, habitId), gte(schema.checkIns.date, thirtyDaysAgo)))
        .orderBy(desc(schema.checkIns.date));

      // Calculate streak
      let currentStreak = 0;
      let lastProcessedDate: Date | null = null;

      for (const checkIn of checkIns) {
        const checkInDate = new Date(checkIn.date);
        checkInDate.setUTCHours(0, 0, 0, 0);

        if (lastProcessedDate === null) {
          lastProcessedDate = new Date();
          lastProcessedDate.setUTCHours(0, 0, 0, 0);
        }

        const expectedDate = new Date(lastProcessedDate);
        expectedDate.setDate(expectedDate.getDate() - 1);

        if (checkInDate.getTime() === lastProcessedDate.getTime()) {
          currentStreak++;
          lastProcessedDate = expectedDate;
        } else if (checkInDate.getTime() < lastProcessedDate.getTime()) {
          break;
        }
      }

      // Calculate consistency
      const expectedCheckIns = await getExpectedCheckInsForDateRange(
        app.db,
        habitId,
        thirtyDaysAgo,
        today
      );
      const completedCheckIns = checkIns.length;
      const consistency = calculateConsistency(completedCheckIns, expectedCheckIns);

      // Calculate habit strength
      const missedDays = Math.max(0, expectedCheckIns - completedCheckIns);
      const habitStrength = calculateHabitStrength(completedCheckIns, missedDays);

      // Calculate best day of week
      const dayOfWeekStats = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
      checkIns.forEach((checkIn) => {
        const date = new Date(checkIn.date);
        dayOfWeekStats[date.getDay()]++;
      });
      const bestDayOfWeek = dayOfWeekStats.indexOf(Math.max(...dayOfWeekStats));

      // Generate monthly heatmap data (30 days)
      const heatmapData: Record<string, number> = {};
      const checkInByDate: Record<string, number> = {};

      checkIns.forEach((checkIn) => {
        checkInByDate[checkIn.date] = 1;
      });

      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = getDateString(d);
        heatmapData[dateStr] = checkInByDate[dateStr] ? 1 : 0;
      }

      return {
        habitId,
        habitTitle: habit.title,
        currentStreak,
        consistency,
        habitStrength,
        completedIn30Days: completedCheckIns,
        expectedIn30Days: expectedCheckIns,
        bestDayOfWeek,
        heatmapData,
      };
    }
  );

  // GET /api/stats/weekly-review - Get weekly summary
  app.fastify.get(
    '/api/stats/weekly-review',
    {
      schema: {
        description: 'Get weekly summary',
        tags: ['stats'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const today = getDateString(new Date());
      const sevenDaysAgo = daysAgo(6);

      // Get all active habits
      const habits = await app.db.query.habits.findMany({
        where: and(eq(schema.habits.userId, session.user.id), eq(schema.habits.isActive, true)),
      });

      const habitSummaries = await Promise.all(
        habits.map(async (habit) => {
          const checkIns = await app.db
            .select()
            .from(schema.checkIns)
            .where(
              and(
                eq(schema.checkIns.habitId, habit.id),
                gte(schema.checkIns.date, sevenDaysAgo)
              )
            );

          const expectedCheckIns = await getExpectedCheckInsForDateRange(
            app.db,
            habit.id,
            sevenDaysAgo,
            today
          );
          const completedCheckIns = checkIns.length;
          const consistency = calculateConsistency(completedCheckIns, expectedCheckIns);

          return {
            habitId: habit.id,
            habitTitle: habit.title,
            completed: completedCheckIns,
            expected: expectedCheckIns,
            consistency,
          };
        })
      );

      const totalCompleted = habitSummaries.reduce((sum, h) => sum + h.completed, 0);
      const totalExpected = habitSummaries.reduce((sum, h) => sum + h.expected, 0);
      const overallConsistency = calculateConsistency(totalCompleted, totalExpected);

      const insights = [];

      // Generate insights
      const completedHabits = habitSummaries.filter((h) => h.consistency === 100);
      if (completedHabits.length === habitSummaries.length && habitSummaries.length > 0) {
        insights.push('🎉 Perfect week! You completed all your habits!');
      } else if (completedHabits.length > 0) {
        insights.push(
          `✨ Great job! You completed ${completedHabits.length} out of ${habitSummaries.length} habits.`
        );
      }

      const lowestConsistency = Math.min(...habitSummaries.map((h) => h.consistency));
      if (lowestConsistency < 50 && lowestConsistency > 0) {
        const needsWork = habitSummaries.find((h) => h.consistency === lowestConsistency);
        if (needsWork) {
          insights.push(
            `💪 Focus on "${needsWork.habitTitle}" - only ${needsWork.consistency}% completion this week.`
          );
        }
      }

      if (habitSummaries.length === 0) {
        insights.push('Start creating habits to build your momentum!');
      }

      return {
        week: {
          startDate: sevenDaysAgo,
          endDate: today,
        },
        totalCompleted,
        totalExpected,
        overallConsistency,
        habits: habitSummaries,
        insights,
      };
    }
  );
}
