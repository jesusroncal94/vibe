import { router } from '../trpc';
import { healthRouter } from './health';
import { chatRouter } from './chat';
import { settingsRouter } from './settings';
import { tagsRouter } from './tags';
import { filesRouter } from './files';

export const appRouter = router({
  health: healthRouter,
  chat: chatRouter,
  settings: settingsRouter,
  tags: tagsRouter,
  files: filesRouter,
});

export type AppRouter = typeof appRouter;
