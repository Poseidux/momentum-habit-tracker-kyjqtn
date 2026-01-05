import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import type { App } from '../index.js';
import * as schema from '../db/schema.js';
import * as authSchema from '../db/auth-schema.js';

const PRESET_THEMES = [
  {
    themeName: 'Ocean Blue',
    primaryColor: '#0ea5e9',
    secondaryColor: '#06b6d4',
    backgroundColor: '#ecf0f1',
    cardColor: '#ffffff',
    textColor: '#1e293b',
  },
  {
    themeName: 'Forest Green',
    primaryColor: '#10b981',
    secondaryColor: '#14b8a6',
    backgroundColor: '#ecfdf5',
    cardColor: '#ffffff',
    textColor: '#064e3b',
  },
  {
    themeName: 'Sunset Orange',
    primaryColor: '#f97316',
    secondaryColor: '#fb923c',
    backgroundColor: '#fff7ed',
    cardColor: '#ffffff',
    textColor: '#7c2d12',
  },
  {
    themeName: 'Purple Dream',
    primaryColor: '#a855f7',
    secondaryColor: '#d946ef',
    backgroundColor: '#faf5ff',
    cardColor: '#ffffff',
    textColor: '#581c87',
  },
  {
    themeName: 'Midnight Dark',
    primaryColor: '#1e293b',
    secondaryColor: '#334155',
    backgroundColor: '#0f172a',
    cardColor: '#1e293b',
    textColor: '#e2e8f0',
  },
];

export function registerThemesRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // Initialize preset themes on first call
  let presetsInitialized = false;

  async function ensurePresetsExist(db: any) {
    if (presetsInitialized) return;

    for (const theme of PRESET_THEMES) {
      const existing = await db.query.themes.findFirst({
        where: and(eq(schema.themes.themeName, theme.themeName), eq(schema.themes.isPreset, true)),
      });

      if (!existing) {
        await db.insert(schema.themes).values({
          themeName: theme.themeName,
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          backgroundColor: theme.backgroundColor,
          cardColor: theme.cardColor,
          textColor: theme.textColor,
          isPreset: true,
          isActive: false,
        });
      }
    }

    presetsInitialized = true;
  }

  // GET /api/themes - Get all available themes
  app.fastify.get(
    '/api/themes',
    {
      schema: {
        description: 'Get all available themes (presets + user custom)',
        tags: ['themes'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      await ensurePresetsExist(app.db);

      // Get preset themes
      const presets = await app.db.query.themes.findMany({
        where: eq(schema.themes.isPreset, true),
      });

      // Get user's custom themes
      const customThemes = await app.db.query.themes.findMany({
        where: and(eq(schema.themes.userId, session.user.id), eq(schema.themes.isPreset, false)),
      });

      return {
        presets,
        custom: customThemes,
      };
    }
  );

  // POST /api/themes/activate - Activate a theme
  app.fastify.post(
    '/api/themes/activate',
    {
      schema: {
        description: 'Activate a theme for the user',
        tags: ['themes'],
        body: {
          type: 'object',
          required: ['themeId'],
          properties: {
            themeId: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { themeId } = request.body as any;

      const theme = await app.db.query.themes.findFirst({
        where: eq(schema.themes.id, themeId),
      });

      if (!theme) {
        return reply.code(404).send({ message: 'Theme not found' });
      }

      // If custom theme, verify ownership
      if (!theme.isPreset && theme.userId !== session.user.id) {
        return reply.code(403).send({ message: 'Cannot activate another user\'s custom theme' });
      }

      // Deactivate all user's active themes
      await app.db
        .update(schema.themes)
        .set({ isActive: false })
        .where(
          and(
            eq(schema.themes.userId, session.user.id),
            eq(schema.themes.isActive, true)
          )
        );

      // Activate selected theme
      const [updated] = await app.db
        .update(schema.themes)
        .set({ isActive: true })
        .where(eq(schema.themes.id, themeId))
        .returning();

      return updated;
    }
  );

  // GET /api/themes/active - Get user's active theme
  app.fastify.get(
    '/api/themes/active',
    {
      schema: {
        description: "Get the user's active theme",
        tags: ['themes'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const activeTheme = await app.db.query.themes.findFirst({
        where: and(eq(schema.themes.userId, session.user.id), eq(schema.themes.isActive, true)),
      });

      if (activeTheme) {
        return activeTheme;
      }

      // If no active theme, return first preset as default
      await ensurePresetsExist(app.db);

      const defaultTheme = await app.db.query.themes.findFirst({
        where: eq(schema.themes.isPreset, true),
      });

      return defaultTheme || {};
    }
  );

  // POST /api/themes/custom - Create custom theme (premium only)
  app.fastify.post(
    '/api/themes/custom',
    {
      schema: {
        description: 'Create a custom theme (premium users)',
        tags: ['themes'],
        body: {
          type: 'object',
          required: ['themeName', 'primaryColor', 'secondaryColor', 'backgroundColor', 'cardColor', 'textColor'],
          properties: {
            themeName: { type: 'string', maxLength: 50 },
            primaryColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
            secondaryColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
            backgroundColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
            cardColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
            textColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      // Check if premium
      const currentUser = await app.db.query.user.findFirst({
        where: eq(authSchema.user.id, session.user.id),
      });

      if (!currentUser?.isPremium) {
        return reply.code(403).send({ message: 'Custom themes are a premium feature' });
      }

      const { themeName, primaryColor, secondaryColor, backgroundColor, cardColor, textColor } =
        request.body as any;

      const [newTheme] = await app.db
        .insert(schema.themes)
        .values({
          userId: session.user.id,
          themeName,
          primaryColor,
          secondaryColor,
          backgroundColor,
          cardColor,
          textColor,
          isPreset: false,
        })
        .returning();

      return reply.code(201).send(newTheme);
    }
  );

  // DELETE /api/themes/custom/:id - Delete custom theme
  app.fastify.delete(
    '/api/themes/custom/:id',
    {
      schema: {
        description: 'Delete a custom theme',
        tags: ['themes'],
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

      const theme = await app.db.query.themes.findFirst({
        where: eq(schema.themes.id, id),
      });

      if (!theme) {
        return reply.code(404).send({ message: 'Theme not found' });
      }

      if (theme.userId !== session.user.id || theme.isPreset) {
        return reply.code(403).send({ message: 'Cannot delete this theme' });
      }

      await app.db.delete(schema.themes).where(eq(schema.themes.id, id));

      return reply.code(204).send();
    }
  );
}
