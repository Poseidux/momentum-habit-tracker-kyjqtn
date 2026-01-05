import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import type { App } from '../index.js';
import * as schema from '../db/schema.js';
import * as authSchema from '../db/auth-schema.js';

const XP_BASE = 10;
const STREAK_MILESTONES = [7, 14, 30, 60, 90];
const STREAK_MILESTONE_XP = 50;

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getTodayStart(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function calculateDaysSinceLastCheckIn(checkIns: any[]): number {
  if (checkIns.length === 0) return 0;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const checkIn of checkIns) {
    const checkInDate = new Date(checkIn.completedAt);
    checkInDate.setUTCHours(0, 0, 0, 0);

    if (checkInDate.getTime() === today.getTime()) {
      return 0; // Already checked in today
    }
  }

  const lastCheckInDate = new Date(checkIns[0].completedAt);
  lastCheckInDate.setUTCHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - lastCheckInDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff;
}

async function calculateHabitStats(
  db: any,
  habitId: string
): Promise<{ streak: number; habitStrength: number; consistencyPercent: number }> {
  const checkIns = await db
    .select()
    .from(schema.checkIns)
    .where(eq(schema.checkIns.habitId, habitId))
    .orderBy(desc(schema.checkIns.completedAt));

  if (checkIns.length === 0) {
    return { streak: 0, habitStrength: 100, consistencyPercent: 0 };
  }

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let currentDate = new Date(today);

  for (const checkIn of checkIns) {
    const checkInDate = new Date(checkIn.completedAt);
    checkInDate.setUTCHours(0, 0, 0, 0);

    if (checkInDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (checkInDate.getTime() < currentDate.getTime()) {
      break;
    }
  }

  // Calculate consistency (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

  const recentCheckIns = checkIns.filter((c) => {
    const date = new Date(c.completedAt);
    date.setUTCHours(0, 0, 0, 0);
    return date.getTime() >= thirtyDaysAgo.getTime();
  });

  const consistencyPercent = Math.min(100, Math.round((recentCheckIns.length / 30) * 100));

  // Calculate habit strength: ratio of completed vs missed
  const totalDays = 30;
  const completedDays = recentCheckIns.length;
  const missedDays = Math.max(0, totalDays - completedDays);
  const habitStrength = completedDays > 0
    ? Math.round((completedDays / (completedDays + missedDays)) * 100)
    : 0;

  return { streak, habitStrength, consistencyPercent };
}

export function registerCheckInRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // POST /api/check-ins - Create check-in
  app.fastify.post(
    '/api/check-ins',
    {
      schema: {
        description: 'Create a check-in for a habit',
        tags: ['check-ins'],
        body: {
          type: 'object',
          required: ['habitId'],
          properties: {
            habitId: { type: 'string' },
            value: { type: 'integer' },
            note: { type: 'string' },
            mood: { type: 'integer' },
            effort: { type: 'integer' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { habitId, value, note, mood, effort } = request.body as any;

      // Verify habit ownership
      const habit = await app.db.query.habits.findFirst({
        where: and(eq(schema.habits.id, habitId), eq(schema.habits.userId, session.user.id)),
      });

      if (!habit) {
        return reply.code(404).send({ message: 'Habit not found' });
      }

      const completedAt = new Date();

      // Create check-in
      const [checkIn] = await app.db
        .insert(schema.checkIns)
        .values({
          habitId,
          userId: session.user.id,
          completedAt,
          value,
          note,
          mood: mood ? Math.max(1, Math.min(5, mood)) : undefined,
          effort: effort ? Math.max(1, Math.min(5, effort)) : undefined,
        })
        .returning();

      // Calculate stats and update habit
      const { streak, habitStrength, consistencyPercent } = await calculateHabitStats(
        app.db,
        habitId
      );

      await app.db
        .update(schema.habits)
        .set({
          streak,
          habitStrength,
          consistencyPercent,
          updatedAt: new Date(),
        })
        .where(eq(schema.habits.id, habitId));

      // Calculate XP
      let xpAwarded = XP_BASE;
      if (STREAK_MILESTONES.includes(streak)) {
        xpAwarded += STREAK_MILESTONE_XP;
      }

      // Get or create user stats
      let stats = await app.db.query.userStats.findFirst({
        where: eq(schema.userStats.userId, session.user.id),
      });

      if (!stats) {
        [stats] = await app.db
          .insert(schema.userStats)
          .values({
            userId: session.user.id,
            currentStreak: streak,
            longestStreak: streak,
            totalCheckIns: 1,
          })
          .returning();
      } else {
        const newTotalCheckIns = stats.totalCheckIns + 1;
        const newLongestStreak = Math.max(stats.longestStreak, streak);

        [stats] = await app.db
          .update(schema.userStats)
          .set({
            currentStreak: streak,
            longestStreak: newLongestStreak,
            totalCheckIns: newTotalCheckIns,
          })
          .where(eq(schema.userStats.userId, session.user.id))
          .returning();
      }

      // Update user XP and level
      const newTotalXp = (await app.db.query.user.findFirst({
        where: eq(authSchema.user.id, session.user.id),
      }))?.totalXp || 0;

      const updatedXp = newTotalXp + xpAwarded;
      const newLevel = Math.floor(Math.sqrt(updatedXp / 100));

      await app.db
        .update(authSchema.user)
        .set({
          totalXp: updatedXp,
          level: newLevel,
        })
        .where(eq(authSchema.user.id, session.user.id));

      return reply.code(201).send({
        checkIn,
        xpAwarded,
        currentStreak: streak,
        userStats: {
          totalXp: updatedXp,
          level: newLevel,
        },
      });
    }
  );

  // GET /api/check-ins/today - Get today's check-ins
  app.fastify.get(
    '/api/check-ins/today',
    {
      schema: {
        description: "Get today's check-ins",
        tags: ['check-ins'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const today = getTodayStart();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const checkIns = await app.db
        .select()
        .from(schema.checkIns)
        .where(
          and(
            eq(schema.checkIns.userId, session.user.id),
            gte(schema.checkIns.completedAt, today),
            lte(schema.checkIns.completedAt, tomorrow)
          )
        )
        .orderBy(desc(schema.checkIns.completedAt));

      return checkIns;
    }
  );

  // GET /api/check-ins/habit/:habitId - Get check-ins for a habit
  app.fastify.get(
    '/api/check-ins/habit/:habitId',
    {
      schema: {
        description: 'Get check-ins for a habit',
        tags: ['check-ins'],
        params: {
          type: 'object',
          required: ['habitId'],
          properties: { habitId: { type: 'string' } },
        },
        querystring: {
          type: 'object',
          properties: {
            startDate: { type: 'string' },
            endDate: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { habitId } = request.params as { habitId: string };
      const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };

      // Verify habit ownership
      const habit = await app.db.query.habits.findFirst({
        where: and(eq(schema.habits.id, habitId), eq(schema.habits.userId, session.user.id)),
      });

      if (!habit) {
        return reply.code(404).send({ message: 'Habit not found' });
      }

      let whereClause = eq(schema.checkIns.habitId, habitId);

      if (startDate) {
        whereClause = and(whereClause, gte(schema.checkIns.completedAt, new Date(startDate)));
      }

      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        whereClause = and(whereClause, lte(schema.checkIns.completedAt, endDateTime));
      }

      const checkIns = await app.db
        .select()
        .from(schema.checkIns)
        .where(whereClause)
        .orderBy(desc(schema.checkIns.completedAt));

      return checkIns;
    }
  );

  // PUT /api/check-ins/:id - Update check-in
  app.fastify.put(
    '/api/check-ins/:id',
    {
      schema: {
        description: 'Update a check-in',
        tags: ['check-ins'],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { id } = request.params as { id: string };
      const { note, mood, effort } = request.body as any;

      // Verify ownership
      const existingCheckIn = await app.db.query.checkIns.findFirst({
        where: and(eq(schema.checkIns.id, id), eq(schema.checkIns.userId, session.user.id)),
      });

      if (!existingCheckIn) {
        return reply.code(404).send({ message: 'Check-in not found' });
      }

      const [updated] = await app.db
        .update(schema.checkIns)
        .set({
          note: note !== undefined ? note : existingCheckIn.note,
          mood: mood ? Math.max(1, Math.min(5, mood)) : existingCheckIn.mood,
          effort: effort ? Math.max(1, Math.min(5, effort)) : existingCheckIn.effort,
        })
        .where(eq(schema.checkIns.id, id))
        .returning();

      return updated;
    }
  );
}
