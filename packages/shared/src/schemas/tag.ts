import { z } from 'zod';

export const tagSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  color: z.string().default('#6366f1'),
});

export const createTagSchema = tagSchema.omit({ id: true });

export type Tag = z.infer<typeof tagSchema>;
export type CreateTag = z.infer<typeof createTagSchema>;
