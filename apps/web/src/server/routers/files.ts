import { z } from 'zod';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import {
  getFile,
  getFilesWithPagination,
  deleteFile,
  deleteFiles,
  getFileStats,
} from '@vibe/db';
import { logger } from '@/lib/logger';

function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
}

export const filesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.string().optional(),
        direction: z.string().optional(),
        conversationId: z.string().optional(),
        offset: z.number().int().min(0).default(0),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(({ input }) => {
      return getFilesWithPagination(input);
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const file = getFile(input.id);
      if (!file) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' });
      }
      return file;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const file = getFile(input.id);
      if (!file) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' });
      }

      try {
        await unlink(join(getUploadsDir(), file.path));
      } catch (err) {
        logger.warn({ err, fileId: input.id }, 'Failed to delete file from disk');
      }

      // Delete thumbnail if present
      const metadata = file.metadata as Record<string, unknown> | null;
      if (metadata?.thumbnailPath) {
        try {
          await unlink(join(getUploadsDir(), metadata.thumbnailPath as string));
        } catch {
          // Thumbnail may not exist
        }
      }

      deleteFile(input.id);
      return { success: true };
    }),

  batchDelete: publicProcedure
    .input(z.object({ ids: z.array(z.string()).min(1) }))
    .mutation(async ({ input }) => {
      for (const id of input.ids) {
        const file = getFile(id);
        if (file) {
          try {
            await unlink(join(getUploadsDir(), file.path));
          } catch {
            // File may already be deleted from disk
          }
        }
      }
      deleteFiles(input.ids);
      return { success: true };
    }),

  stats: publicProcedure.query(() => {
    return getFileStats();
  }),
});
