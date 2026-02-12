import { join } from 'node:path';
import { getFile, updateFileMetadata } from '@vibe/db';
import { runOcr } from '@/lib/server/document-processors';

function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const file = getFile(id);
  if (!file) {
    return Response.json({ error: 'File not found' }, { status: 404 });
  }

  const filePath = join(getUploadsDir(), file.path);
  const result = await runOcr(filePath);

  if (!result) {
    return Response.json({ error: 'OCR failed' }, { status: 500 });
  }

  const existingMetadata = (file.metadata as Record<string, unknown>) ?? {};
  const updatedMetadata = {
    ...existingMetadata,
    ocrText: result.text,
    ocrConfidence: result.confidence,
  };

  updateFileMetadata(id, updatedMetadata);

  return Response.json({ text: result.text, confidence: result.confidence });
}
