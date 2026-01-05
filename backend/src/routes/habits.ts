import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, isNull, desc, gte, lte } from 'drizzle-orm';
import type { App } from '../index.js';
import * as schema from '../db/schema.js';

export function registerHabitRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // POST /api/habits - Create a new habit
  app.fastify.post(
    '/api/habits',
    {
      schema: {
        description: 'Create a new habit',
        tags: ['habits'],
        body: {
          type: 'object',
          required: ['title', 'habitType', 'scheduleType'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            habitType: { type: 'string', enum: ['yes_no', 'count', 'duration'] },
            targetValue: { type: 'integer' },
            scheduleType: { type: 'string', enum: ['daily', 'specific_days', 'times_per_week'] },
            scheduleConfig: { type: 'object' },
            tags: { type: 'array', items: { type: 'string' } },
            color: { type: 'string' },
            icon: { type: 'string' },
            reminderTime: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const {
        title,
        description,
        habitType = 'yes_no',
        targetValue,
        scheduleType = 'daily',
        scheduleConfig,
        tags = [],
        color = '#3b82f6',
        icon = 'circle',
        reminderTime,
      } = request.body as any;

      const [habit] = await app.db
        .insert(schema.habits)
        .values({
          userId: session.user.id,
          title,
          description,
          habitType: habitType as any,
          targetValue,
          scheduleType: scheduleType as any,
          scheduleConfig,
          tags,
          color,
          icon,
          reminderTime,
        })
        .returning();

      return reply.code(201).send(habit);
    }
  );

  // GET /api/habits - Get all active habits for the authenticated user
  app.fastify.get(
    '/api/habits',
    {
      schema: {
        description: 'Get all active habits for the user',
        tags: ['habits'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const habits = await app.db.query.habits.findMany({
        where: and(eq(schema.habits.userId, session.user.id), eq(schema.habits.isActive, true)),
        orderBy: desc(schema.habits.createdAt),
      });

      return habits;
    }
  );

  // GET /api/habits/:id - Get a specific habit with its check-in history
  app.fastify.get(
    '/api/habits/:id',
    {
      schema: {
        description: 'Get a specific habit with check-in history',
        tags: ['habits'],
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

      const habit = await app.db.query.habits.findFirst({
        where: and(eq(schema.habits.id, id), eq(schema.habits.userId, session.user.id)),
        with: {
          checkIns: {
            orderBy: desc(schema.checkIns.date),
          },
        },
      });

      if (!habit) {
        return reply.code(404).send({ message: 'Habit not found' });
      }

      return habit;
    }
  );

  // PUT /api/habits/:id - Update a habit
  app.fastify.put(
    '/api/habits/:id',
    {
      schema: {
        description: 'Update a habit',
        tags: ['habits'],
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
      const updates = request.body as any;

      // Verify ownership
      const existingHabit = await app.db.query.habits.findFirst({
        where: and(eq(schema.habits.id, id), eq(schema.habits.userId, session.user.id)),
      });

      if (!existingHabit) {
        return reply.code(404).send({ message: 'Habit not found' });
      }

      const [updated] = await app.db
        .update(schema.habits)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.habits.id, id))
        .returning();

      return updated;
    }
  );

  // DELETE /api/habits/:id - Soft delete a habit
  app.fastify.delete(
    '/api/habits/:id',
    {
      schema: {
        description: 'Soft delete a habit',
        tags: ['habits'],
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

      // Verify ownership
      const existingHabit = await app.db.query.habits.findFirst({
        where: and(eq(schema.habits.id, id), eq(schema.habits.userId, session.user.id)),
      });

      if (!existingHabit) {
        return reply.code(404).send({ message: 'Habit not found' });
      }

      await app.db.update(schema.habits).set({ isActive: false }).where(eq(schema.habits.id, id));

      return reply.code(204).send();
    }
  );
}
