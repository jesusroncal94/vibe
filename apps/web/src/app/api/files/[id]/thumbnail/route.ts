import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getFile } from '@vibe/db';

function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const file = getFile(id);
  if (!file) {
    return Response.json({ error: 'File not found' }, { status: 404 });
  }

  const metadata = file.metadata as Record<string, unknown> | null;
  const thumbnailPath = metadata?.thumbnailPath as string | undefined;

  // Serve thumbnail if available, otherwise fall back to original
  const servePath = thumbnailPath
    ? join(getUploadsDir(), thumbnailPath)
    : join(getUploadsDir(), file.path);

  let buffer: Buffer;
  try {
    buffer = await readFile(servePath);
  } catch {
    return Response.json({ error: 'Thumbnail not found' }, { status: 404 });
  }

  const contentType = thumbnailPath ? 'image/jpeg' : file.mimeType;

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
