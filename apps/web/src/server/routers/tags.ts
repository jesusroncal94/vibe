import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import {
  createTag,
  getTags,
  deleteTag,
  getTagsForConversation,
  assignTag,
  removeTag,
} from '@vibe/db';

export const tagsRouter = router({
  list: publicProcedure.query(() => {
    return getTags();
  }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1), color: z.string().optional() }))
    .mutation(({ input }) => {
      return createTag(input);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      deleteTag(input.id);
      return { success: true };
    }),

  forConversation: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(({ input }) => {
      return getTagsForConversation(input.conversationId);
    }),

  assign: publicProcedure
    .input(z.object({ conversationId: z.string(), tagId: z.string() }))
    .mutation(({ input }) => {
      assignTag(input.conversationId, input.tagId);
      return { success: true };
    }),

  remove: publicProcedure
    .input(z.object({ conversationId: z.string(), tagId: z.string() }))
    .mutation(({ input }) => {
      removeTag(input.conversationId, input.tagId);
      return { success: true };
    }),
});
