import { router } from '../trpc';
import { healthRouter } from './health';
import { chatRouter } from './chat';
import { settingsRouter } from './settings';
import { tagsRouter } from './tags';

export const appRouter = router({
  health: healthRouter,
  chat: chatRouter,
  settings: settingsRouter,
  tags: tagsRouter,
});

export type AppRouter = typeof appRouter;
