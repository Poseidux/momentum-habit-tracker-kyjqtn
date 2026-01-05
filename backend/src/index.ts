import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';
import { registerHabitRoutes } from './routes/habits.js';
import { registerCheckInRoutes } from './routes/check-ins.js';
import { registerStatsRoutes } from './routes/stats.js';
import { registerHabitGroupRoutes } from './routes/habit-groups.js';
import { registerThemesRoutes } from './routes/themes.js';

// Combine both app and auth schemas
const schema = { ...appSchema, ...authSchema };

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Set up Better Auth (automatically enables email/password, Google OAuth, and Apple OAuth via proxy)
app.withAuth();

// Register all routes AFTER app is created
registerHabitRoutes(app);
registerCheckInRoutes(app);
registerStatsRoutes(app);
registerHabitGroupRoutes(app);
registerThemesRoutes(app);

await app.run();
app.logger.info('Habit tracking API running');
