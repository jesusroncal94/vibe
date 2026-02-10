import { z } from 'zod';

export const conversationSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  model: z.string().default('claude-sonnet-4-5'),
  layout: z.enum(['focus', 'minimal', 'productivity']).default('minimal'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createConversationSchema = conversationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Conversation = z.infer<typeof conversationSchema>;
export type CreateConversation = z.infer<typeof createConversationSchema>;
