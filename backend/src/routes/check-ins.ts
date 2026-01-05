import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import type { App } from '../index.js';
import * as schema from '../db/schema.js';

const XP_PER_CHECK_IN = 10;
const XP_PER_STREAK_MILESTONE = 5;
const STREAK_MILESTONE = 7;

function getDateString(date: Date | string): string {
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return getDateString(d);
}

async function calculateStreak(
  db: any,
  habitId: string,
  asOfDate: string
): Promise<{ currentStreak: number; longestStreak: number }> {
  const checkIns = await db
    .select()
    .from(schema.checkIns)
    .where(eq(schema.checkIns.habitId, habitId))
    .orderBy(desc(schema.checkIns.date));

  let currentStreak = 0;
  let longestStreak = 0;
  let lastProcessedDate: Date | null = null;

  for (const checkIn of checkIns) {
    const checkInDate = new Date(checkIn.date);
    checkInDate.setUTCHours(0, 0, 0, 0);

    if (lastProcessedDate === null) {
      lastProcessedDate = new Date(asOfDate);
      lastProcessedDate.setUTCHours(0, 0, 0, 0);
    }

    const expectedDate = new Date(lastProcessedDate);
    expectedDate.setDate(expectedDate.getDate() - 1);

    if (checkInDate.getTime() === lastProcessedDate.getTime()) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
      lastProcessedDate = expectedDate;
    } else if (checkInDate.getTime() < lastProcessedDate.getTime()) {
      break;
    }
  }

  return { currentStreak, longestStreak };
}

async function getOrCreateUserStats(db: any, userId: string) {
  let stats = await db.query.userStats.findFirst({
    where: eq(schema.userStats.userId, userId),
  });

  if (!stats) {
    [stats] = await db
      .insert(schema.userStats)
      .values({
        userId,
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        graceSkipsUsedThisWeek: 0,
      })
      .returning();
  }

  return stats;
}

function calculateLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

export function registerCheckInRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // POST /api/check-ins - Record a check-in for a habit
  app.fastify.post(
    '/api/check-ins',
    {
      schema: {
        description: 'Record a check-in for a habit',
        tags: ['check-ins'],
        body: {
          type: 'object',
          required: ['habitId', 'value'],
          properties: {
            habitId: { type: 'string' },
            value: { type: 'integer' },
            date: { type: 'string' },
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

      const { habitId, value, date = getDateString(new Date()), note, mood, effort } =
        request.body as any;

      // Verify habit ownership
      const habit = await app.db.query.habits.findFirst({
        where: and(eq(schema.habits.id, habitId), eq(schema.habits.userId, session.user.id)),
      });

      if (!habit) {
        return reply.code(404).send({ message: 'Habit not found' });
      }

      // Check if check-in already exists for this date
      const existingCheckIn = await app.db.query.checkIns.findFirst({
        where: and(eq(schema.checkIns.habitId, habitId), eq(schema.checkIns.date, date)),
      });

      if (existingCheckIn) {
        return reply
          .code(409)
          .send({ message: 'Check-in already exists for this habit on this date' });
      }

      // Create check-in
      const [checkIn] = await app.db
        .insert(schema.checkIns)
        .values({
          habitId,
          userId: session.user.id,
          date,
          value,
          note,
          mood: mood ? Math.max(1, Math.min(5, mood)) : undefined,
          effort: effort ? Math.max(1, Math.min(5, effort)) : undefined,
        })
        .returning();

      // Calculate streak and award XP
      const { currentStreak } = await calculateStreak(app.db, habitId, date);

      // Get or create user stats
      let stats = await getOrCreateUserStats(app.db, session.user.id);

      // Calculate XP
      let xpAwarded = XP_PER_CHECK_IN;
      if (currentStreak > 0 && currentStreak % STREAK_MILESTONE === 0) {
        xpAwarded += XP_PER_STREAK_MILESTONE;
      }

      const newTotalXp = stats.totalXp + xpAwarded;
      const newLevel = calculateLevel(newTotalXp);

      // Update user stats
      [stats] = await app.db
        .update(schema.userStats)
        .set({
          totalXp: newTotalXp,
          level: newLevel,
        })
        .where(eq(schema.userStats.userId, session.user.id))
        .returning();

      return reply.code(201).send({
        checkIn,
        xpAwarded,
        currentStreak,
        userStats: {
          totalXp: stats.totalXp,
          level: stats.level,
        },
      });
    }
  );

  // GET /api/check-ins/today - Get all check-ins for today
  app.fastify.get(
    '/api/check-ins/today',
    {
      schema: {
        description: "Get all check-ins for today for the user",
        tags: ['check-ins'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const today = getDateString(new Date());

      const checkIns = await app.db
        .select()
        .from(schema.checkIns)
        .where(
          and(eq(schema.checkIns.userId, session.user.id), eq(schema.checkIns.date, today))
        )
        .orderBy(desc(schema.checkIns.createdAt));

      return checkIns;
    }
  );

  // GET /api/check-ins/habit/:habitId - Get check-in history with date range support
  app.fastify.get(
    '/api/check-ins/habit/:habitId',
    {
      schema: {
        description: 'Get check-in history for a specific habit',
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
      const { startDate, endDate } = request.query as {
        startDate?: string;
        endDate?: string;
      };

      // Verify habit ownership
      const habit = await app.db.query.habits.findFirst({
        where: and(eq(schema.habits.id, habitId), eq(schema.habits.userId, session.user.id)),
      });

      if (!habit) {
        return reply.code(404).send({ message: 'Habit not found' });
      }

      let whereClause = eq(schema.checkIns.habitId, habitId);

      if (startDate) {
        whereClause = and(whereClause, gte(schema.checkIns.date, startDate));
      }

      if (endDate) {
        whereClause = and(whereClause, lte(schema.checkIns.date, endDate));
      }

      const checkIns = await app.db
        .select()
        .from(schema.checkIns)
        .where(whereClause)
        .orderBy(desc(schema.checkIns.date));

      return checkIns;
    }
  );

  // PUT /api/check-ins/:id - Update a check-in
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
          note,
          mood: mood ? Math.max(1, Math.min(5, mood)) : existingCheckIn.mood,
          effort: effort ? Math.max(1, Math.min(5, effort)) : existingCheckIn.effort,
        })
        .where(eq(schema.checkIns.id, id))
        .returning();

      return updated;
    }
  );
}
