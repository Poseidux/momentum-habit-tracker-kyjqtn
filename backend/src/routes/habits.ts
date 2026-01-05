import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc, count } from 'drizzle-orm';
import type { App } from '../index.js';
import * as schema from '../db/schema.js';
import * as authSchema from '../db/auth-schema.js';

export function registerHabitRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // POST /api/habits - Create a new habit (check user's habit count)
  app.fastify.post(
    '/api/habits',
    {
      schema: {
        description: 'Create a new habit',
        tags: ['habits'],
        body: {
          type: 'object',
          required: ['title', 'type'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['yes_no', 'count', 'duration'] },
            schedule: { type: 'string' },
            frequency: { type: 'integer' },
            tags: { type: 'array', items: { type: 'string' } },
            customTags: { type: 'array', items: { type: 'string' } },
            icon: { type: 'string' },
            color: { type: 'string' },
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
        type = 'yes_no',
        schedule,
        frequency,
        tags = [],
        customTags = [],
        icon = 'circle',
        color = '#3b82f6',
      } = request.body as any;

      // Get user to check premium status
      const currentUser = await app.db.query.user.findFirst({
        where: eq(authSchema.user.id, session.user.id),
      });

      if (!currentUser) {
        return reply.code(404).send({ message: 'User not found' });
      }

      // Check habit limit for non-premium users
      if (!currentUser.isPremium) {
        const [{ habitCount: userHabitCount }] = await app.db
          .select({ habitCount: count() })
          .from(schema.habits)
          .where(eq(schema.habits.userId, session.user.id));

        if ((userHabitCount as number) >= 3) {
          return reply.code(403).send({
            message: 'Free users can only create up to 3 habits. Upgrade to premium for unlimited habits.',
          });
        }
      }

      const [habit] = await app.db
        .insert(schema.habits)
        .values({
          userId: session.user.id,
          title,
          description,
          type: type as any,
          schedule,
          frequency,
          tags,
          customTags: currentUser.isPremium ? customTags : [],
          icon,
          color,
        })
        .returning();

      return reply.code(201).send(habit);
    }
  );

  // GET /api/habits - Get all user habits
  app.fastify.get(
    '/api/habits',
    {
      schema: {
        description: 'Get all user habits',
        tags: ['habits'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const habits = await app.db.query.habits.findMany({
        where: eq(schema.habits.userId, session.user.id),
        orderBy: desc(schema.habits.createdAt),
      });

      return habits;
    }
  );

  // GET /api/habits/:id - Get single habit with stats
  app.fastify.get(
    '/api/habits/:id',
    {
      schema: {
        description: 'Get single habit with stats',
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
            orderBy: desc(schema.checkIns.completedAt),
          },
        },
      });

      if (!habit) {
        return reply.code(404).send({ message: 'Habit not found' });
      }

      return habit;
    }
  );

  // PUT /api/habits/:id - Update habit
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

  // DELETE /api/habits/:id - Delete habit
  app.fastify.delete(
    '/api/habits/:id',
    {
      schema: {
        description: 'Delete a habit',
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

      await app.db.delete(schema.habits).where(eq(schema.habits.id, id));

      return reply.code(204).send();
    }
  );
}
