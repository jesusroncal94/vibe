import { readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import JSZip from 'jszip';
import { getFile, deleteFiles } from '@vibe/db';
import { logger } from '@/lib/logger';

function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
}

const batchSchema = z.object({
  action: z.enum(['delete', 'download']),
  fileIds: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.message }, { status: 400 });
  }

  const { action, fileIds } = parsed.data;

  if (action === 'delete') {
    for (const id of fileIds) {
      const file = getFile(id);
      if (file) {
        try {
          await unlink(join(getUploadsDir(), file.path));
        } catch (err) {
          logger.warn({ err, fileId: id }, 'Failed to delete file from disk');
        }
        // Delete thumbnail if present
        const meta = file.metadata as Record<string, unknown> | null;
        if (meta?.thumbnailPath) {
          try {
            await unlink(join(getUploadsDir(), meta.thumbnailPath as string));
          } catch {
            // Thumbnail may not exist
          }
        }
      }
    }
    deleteFiles(fileIds);
    return Response.json({ success: true, deleted: fileIds.length });
  }

  if (action === 'download') {
    const zip = new JSZip();

    for (const id of fileIds) {
      const file = getFile(id);
      if (!file) continue;

      try {
        const buffer = await readFile(join(getUploadsDir(), file.path));
        zip.file(file.originalName, buffer);
      } catch (err) {
        logger.warn({ err, fileId: id }, 'Failed to read file for ZIP');
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="files.zip"',
        'Content-Length': String(zipBuffer.length),
      },
    });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}
