import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { getAllSettings, getSetting, setSetting } from '@vibe/db';

export const settingsRouter = router({
  getAll: publicProcedure.query(() => {
    const rows = getAllSettings();
    const result: Record<string, unknown> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }),

  get: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(({ input }) => {
      const row = getSetting(input.key);
      return row?.value ?? null;
    }),

  set: publicProcedure
    .input(z.object({ key: z.string(), value: z.unknown() }))
    .mutation(({ input }) => {
      setSetting(input.key, input.value);
      return { success: true };
    }),
});
