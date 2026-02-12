import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import {
  createConversation,
  getConversation,
  getConversationsWithPreview,
  getMessages,
  deleteConversation,
  renameConversation,
  createMessage,
  getFilesByMessage,
} from '@vibe/db';
import { chat } from '@vibe/claude';

export const chatRouter = router({
  list: publicProcedure.query(() => {
    return getConversationsWithPreview();
  }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        model: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      return createConversation(input);
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const conversation = getConversation(input.id);
      if (!conversation) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversation not found' });
      }
      const msgs = getMessages(input.id);
      const messagesWithFiles = msgs.map((msg) => {
        const files = getFilesByMessage(msg.id).map((f) => ({
          id: f.id,
          originalName: f.originalName,
          size: f.size,
          type: f.type,
          mimeType: f.mimeType,
          metadata: f.metadata as Record<string, unknown> | null,
        }));
        return { ...msg, files };
      });
      return { ...conversation, messages: messagesWithFiles };
    }),

  rename: publicProcedure
    .input(z.object({ id: z.string(), title: z.string().min(1) }))
    .mutation(({ input }) => {
      renameConversation(input.id, input.title);
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      deleteConversation(input.id);
      return { success: true };
    }),

  send: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1),
        model: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      createMessage({
        conversationId: input.conversationId,
        role: 'user',
        content: input.content,
      });

      const response = await chat(input.content, {
        model: (input.model as 'claude-sonnet-4-5' | 'claude-opus-4-5' | 'claude-haiku-4-5') ?? undefined,
      });

      const assistantMessage = createMessage({
        conversationId: input.conversationId,
        role: 'assistant',
        content: response.text,
        model: response.model,
        durationMs: response.durationMs,
      });

      return assistantMessage;
    }),
});
