import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc, gte } from 'drizzle-orm';
import type { App } from '../index.js';
import * as schema from '../db/schema.js';
import * as authSchema from '../db/auth-schema.js';

export function registerStatsRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/stats - Get user stats
  app.fastify.get(
    '/api/stats',
    {
      schema: {
        description: 'Get user stats (XP, level, streaks)',
        tags: ['stats'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      // Get user
      const user = await app.db.query.user.findFirst({
        where: eq(authSchema.user.id, session.user.id),
      });

      if (!user) {
        return reply.code(404).send({ message: 'User not found' });
      }

      // Get user stats
      let stats = await app.db.query.userStats.findFirst({
        where: eq(schema.userStats.userId, session.user.id),
      });

      if (!stats) {
        [stats] = await app.db
          .insert(schema.userStats)
          .values({
            userId: session.user.id,
            currentStreak: 0,
            longestStreak: 0,
            totalCheckIns: 0,
          })
          .returning();
      }

      return {
        totalXp: user.totalXp,
        level: user.level,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        totalCheckIns: stats.totalCheckIns,
      };
    }
  );

  // GET /api/stats/habit/:habitId - Get habit-specific stats
  app.fastify.get(
    '/api/stats/habit/:habitId',
    {
      schema: {
        description: 'Get habit-specific stats',
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

      // Verify habit ownership
      const habit = await app.db.query.habits.findFirst({
        where: and(eq(schema.habits.id, habitId), eq(schema.habits.userId, session.user.id)),
      });

      if (!habit) {
        return reply.code(404).send({ message: 'Habit not found' });
      }

      // Get check-ins for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const checkIns = await app.db
        .select()
        .from(schema.checkIns)
        .where(
          and(eq(schema.checkIns.habitId, habitId), gte(schema.checkIns.completedAt, thirtyDaysAgo))
        )
        .orderBy(desc(schema.checkIns.completedAt));

      return {
        habitId,
        title: habit.title,
        streak: habit.streak,
        habitStrength: habit.habitStrength,
        consistencyPercent: habit.consistencyPercent,
        checkInsLast30Days: checkIns.length,
        totalCheckIns: checkIns.length,
      };
    }
  );
}
