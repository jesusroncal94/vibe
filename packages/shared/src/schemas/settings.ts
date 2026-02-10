import { z } from 'zod';

export const settingSchema = z.object({
  key: z.string(),
  value: z.unknown(),
});

export type Setting = z.infer<typeof settingSchema>;
