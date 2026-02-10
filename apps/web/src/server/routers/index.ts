import { router } from '../trpc';
import { healthRouter } from './health';
import { chatRouter } from './chat';

export const appRouter = router({
  health: healthRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
