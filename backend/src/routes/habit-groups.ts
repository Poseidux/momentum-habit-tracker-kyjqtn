import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import type { App } from '../index.js';
import * as schema from '../db/schema.js';
import * as authSchema from '../db/auth-schema.js';

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function registerHabitGroupRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // POST /api/habit-groups - Create a new habit group
  app.fastify.post(
    '/api/habit-groups',
    {
      schema: {
        description: 'Create a new habit group',
        tags: ['habit-groups'],
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', maxLength: 100 },
            description: { type: 'string' },
            maxMembers: { type: 'integer', minimum: 2, maximum: 100 },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { name, description, maxMembers = 10 } = request.body as any;

      const inviteCode = generateInviteCode();

      const [group] = await app.db
        .insert(schema.habitGroups)
        .values({
          name,
          description,
          createdBy: session.user.id,
          maxMembers,
          inviteCode,
        })
        .returning();

      // Add creator as admin member
      await app.db.insert(schema.habitGroupMembers).values({
        groupId: group.id,
        userId: session.user.id,
        role: 'admin',
      });

      return reply.code(201).send(group);
    }
  );

  // GET /api/habit-groups - Get all groups user is a member of
  app.fastify.get(
    '/api/habit-groups',
    {
      schema: {
        description: 'Get all groups the user is a member of',
        tags: ['habit-groups'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const groups = await app.db.query.habitGroupMembers.findMany({
        where: eq(schema.habitGroupMembers.userId, session.user.id),
        with: {
          group: {
            with: {
              creator: true,
            },
          },
        },
      });

      return groups.map((m) => m.group);
    }
  );

  // GET /api/habit-groups/:id - Get group details with members
  app.fastify.get(
    '/api/habit-groups/:id',
    {
      schema: {
        description: 'Get group details with members',
        tags: ['habit-groups'],
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

      // Verify user is member of group
      const membership = await app.db.query.habitGroupMembers.findFirst({
        where: and(eq(schema.habitGroupMembers.groupId, id), eq(schema.habitGroupMembers.userId, session.user.id)),
      });

      if (!membership) {
        return reply.code(403).send({ message: 'Not a member of this group' });
      }

      const group = await app.db.query.habitGroups.findFirst({
        where: eq(schema.habitGroups.id, id),
        with: {
          creator: true,
          members: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!group) {
        return reply.code(404).send({ message: 'Group not found' });
      }

      return group;
    }
  );

  // POST /api/habit-groups/:id/invite - Invite user by email
  app.fastify.post(
    '/api/habit-groups/:id/invite',
    {
      schema: {
        description: 'Invite a user to the group by email',
        tags: ['habit-groups'],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { id } = request.params as { id: string };
      const { email } = request.body as any;

      // Verify user is admin of group
      const membership = await app.db.query.habitGroupMembers.findFirst({
        where: and(eq(schema.habitGroupMembers.groupId, id), eq(schema.habitGroupMembers.userId, session.user.id)),
      });

      if (!membership || membership.role !== 'admin') {
        return reply.code(403).send({ message: 'Only admins can invite users' });
      }

      const group = await app.db.query.habitGroups.findFirst({
        where: eq(schema.habitGroups.id, id),
      });

      if (!group) {
        return reply.code(404).send({ message: 'Group not found' });
      }

      // Find user by email
      const targetUser = await app.db.query.user.findFirst({
        where: eq(authSchema.user.email, email),
      });

      if (!targetUser) {
        return reply.code(404).send({ message: 'User not found' });
      }

      // Check if already member
      const existingMembership = await app.db.query.habitGroupMembers.findFirst({
        where: and(eq(schema.habitGroupMembers.groupId, id), eq(schema.habitGroupMembers.userId, targetUser.id)),
      });

      if (existingMembership) {
        return reply.code(409).send({ message: 'User is already a member of this group' });
      }

      // Check member limit
      const memberCount = await app.db.query.habitGroupMembers.findMany({
        where: eq(schema.habitGroupMembers.groupId, id),
      });

      if (memberCount.length >= group.maxMembers) {
        return reply.code(403).send({ message: 'Group is at maximum member capacity' });
      }

      // Add user to group
      const [newMember] = await app.db
        .insert(schema.habitGroupMembers)
        .values({
          groupId: id,
          userId: targetUser.id,
          role: 'member',
        })
        .returning();

      return reply.code(201).send(newMember);
    }
  );

  // POST /api/habit-groups/:id/join - Join group with invite code
  app.fastify.post(
    '/api/habit-groups/:id/join',
    {
      schema: {
        description: 'Join a group with invite code',
        tags: ['habit-groups'],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          required: ['inviteCode'],
          properties: {
            inviteCode: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { id } = request.params as { id: string };
      const { inviteCode } = request.body as any;

      const group = await app.db.query.habitGroups.findFirst({
        where: eq(schema.habitGroups.id, id),
      });

      if (!group) {
        return reply.code(404).send({ message: 'Group not found' });
      }

      if (group.inviteCode !== inviteCode) {
        return reply.code(403).send({ message: 'Invalid invite code' });
      }

      // Check if already member
      const existingMembership = await app.db.query.habitGroupMembers.findFirst({
        where: and(eq(schema.habitGroupMembers.groupId, id), eq(schema.habitGroupMembers.userId, session.user.id)),
      });

      if (existingMembership) {
        return reply.code(409).send({ message: 'Already a member of this group' });
      }

      // Check member limit
      const memberCount = await app.db.query.habitGroupMembers.findMany({
        where: eq(schema.habitGroupMembers.groupId, id),
      });

      if (memberCount.length >= group.maxMembers) {
        return reply.code(403).send({ message: 'Group is at maximum member capacity' });
      }

      // Add user to group
      const [newMember] = await app.db
        .insert(schema.habitGroupMembers)
        .values({
          groupId: id,
          userId: session.user.id,
          role: 'member',
        })
        .returning();

      return reply.code(201).send(newMember);
    }
  );

  // DELETE /api/habit-groups/:id/members/:userId - Remove member
  app.fastify.delete(
    '/api/habit-groups/:id/members/:userId',
    {
      schema: {
        description: 'Remove a member from the group',
        tags: ['habit-groups'],
        params: {
          type: 'object',
          required: ['id', 'userId'],
          properties: { id: { type: 'string' }, userId: { type: 'string' } },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { id, userId } = request.params as { id: string; userId: string };

      // Verify user is admin
      const membership = await app.db.query.habitGroupMembers.findFirst({
        where: and(eq(schema.habitGroupMembers.groupId, id), eq(schema.habitGroupMembers.userId, session.user.id)),
      });

      if (!membership || membership.role !== 'admin') {
        return reply.code(403).send({ message: 'Only admins can remove members' });
      }

      await app.db
        .delete(schema.habitGroupMembers)
        .where(
          and(eq(schema.habitGroupMembers.groupId, id), eq(schema.habitGroupMembers.userId, userId))
        );

      return reply.code(204).send();
    }
  );

  // POST /api/habit-groups/:id/challenges - Create challenge
  app.fastify.post(
    '/api/habit-groups/:id/challenges',
    {
      schema: {
        description: 'Create a group challenge',
        tags: ['habit-groups'],
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } },
        },
        body: {
          type: 'object',
          required: ['name', 'startDate', 'endDate'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            habitId: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { id } = request.params as { id: string };
      const { name, description, habitId, startDate, endDate } = request.body as any;

      // Verify user is admin
      const membership = await app.db.query.habitGroupMembers.findFirst({
        where: and(eq(schema.habitGroupMembers.groupId, id), eq(schema.habitGroupMembers.userId, session.user.id)),
      });

      if (!membership || membership.role !== 'admin') {
        return reply.code(403).send({ message: 'Only admins can create challenges' });
      }

      const [challenge] = await app.db
        .insert(schema.habitGroupChallenges)
        .values({
          groupId: id,
          name,
          description,
          habitId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        })
        .returning();

      return reply.code(201).send(challenge);
    }
  );

  // GET /api/habit-groups/:id/challenges - Get group challenges
  app.fastify.get(
    '/api/habit-groups/:id/challenges',
    {
      schema: {
        description: 'Get all challenges for a group',
        tags: ['habit-groups'],
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

      // Verify user is member
      const membership = await app.db.query.habitGroupMembers.findFirst({
        where: and(eq(schema.habitGroupMembers.groupId, id), eq(schema.habitGroupMembers.userId, session.user.id)),
      });

      if (!membership) {
        return reply.code(403).send({ message: 'Not a member of this group' });
      }

      const challenges = await app.db.query.habitGroupChallenges.findMany({
        where: eq(schema.habitGroupChallenges.groupId, id),
        orderBy: desc(schema.habitGroupChallenges.createdAt),
      });

      return challenges;
    }
  );

  // GET /api/habit-groups/:id/leaderboard - Get group leaderboard
  app.fastify.get(
    '/api/habit-groups/:id/leaderboard',
    {
      schema: {
        description: 'Get group member stats/leaderboard',
        tags: ['habit-groups'],
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

      // Verify user is member
      const membership = await app.db.query.habitGroupMembers.findFirst({
        where: and(eq(schema.habitGroupMembers.groupId, id), eq(schema.habitGroupMembers.userId, session.user.id)),
      });

      if (!membership) {
        return reply.code(403).send({ message: 'Not a member of this group' });
      }

      // Get all members with their stats
      const members = await app.db.query.habitGroupMembers.findMany({
        where: eq(schema.habitGroupMembers.groupId, id),
        with: {
          user: true,
        },
      });

      // Get stats for each member
      const leaderboard = await Promise.all(
        members.map(async (m) => {
          const stats = await app.db.query.userStats.findFirst({
            where: eq(schema.userStats.userId, m.userId),
          });

          return {
            userId: m.userId,
            name: m.user.name,
            totalXp: m.user.totalXp,
            level: m.user.level,
            currentStreak: stats?.currentStreak || 0,
            longestStreak: stats?.longestStreak || 0,
            totalCheckIns: stats?.totalCheckIns || 0,
          };
        })
      );

      // Sort by XP
      leaderboard.sort((a, b) => b.totalXp - a.totalXp);

      return leaderboard;
    }
  );
}
