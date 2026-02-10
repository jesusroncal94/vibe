import { z } from 'zod';

export const messageRoleSchema = z.enum(['user', 'assistant', 'system']);

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: messageRoleSchema,
  content: z.string(),
  model: z.string().nullable().optional(),
  tokensIn: z.number().nullable().optional(),
  tokensOut: z.number().nullable().optional(),
  durationMs: z.number().nullable().optional(),
  createdAt: z.date(),
});

export const createMessageSchema = messageSchema.omit({
  id: true,
  createdAt: true,
});

export type Message = z.infer<typeof messageSchema>;
export type CreateMessage = z.infer<typeof createMessageSchema>;
export type MessageRole = z.infer<typeof messageRoleSchema>;
