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

  const filePath = join(getUploadsDir(), file.path);
  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch {
    return Response.json({ error: 'File not found on disk' }, { status: 404 });
  }

  const isImage = file.mimeType.startsWith('image/');
  const disposition = isImage ? 'inline' : `attachment; filename="${file.originalName}"`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': disposition,
      'Content-Length': String(buffer.length),
    },
  });
}
