import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createFile } from '@vibe/db';
import {
  classifyFileType,
  sanitizeFileName,
  extractTextContent,
  FILE_LIMITS,
} from '@/lib/file-utils';

function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const conversationId = formData.get('conversationId') as string | null;
  const fileEntries = formData.getAll('files');

  if (fileEntries.length === 0) {
    return Response.json({ error: 'No files provided' }, { status: 400 });
  }

  if (fileEntries.length > FILE_LIMITS.maxFiles) {
    return Response.json(
      { error: `Maximum ${FILE_LIMITS.maxFiles} files allowed per upload` },
      { status: 400 },
    );
  }

  const results = [];

  for (const entry of fileEntries) {
    if (!(entry instanceof File)) continue;

    if (entry.size > FILE_LIMITS.maxSize) {
      return Response.json(
        { error: `File "${entry.name}" exceeds ${FILE_LIMITS.maxSize / (1024 * 1024)}MB limit` },
        { status: 400 },
      );
    }

    const now = new Date();
    const monthDir = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const uploadDir = join(getUploadsDir(), monthDir);
    await mkdir(uploadDir, { recursive: true });

    const safeName = sanitizeFileName(entry.name);
    const filePath = join(uploadDir, safeName);
    const relativePath = join(monthDir, safeName);

    const buffer = Buffer.from(await entry.arrayBuffer());
    await writeFile(filePath, buffer);

    const fileType = classifyFileType(entry.type, entry.name);
    const extractedText = await extractTextContent(filePath, entry.type, fileType);

    const record = createFile({
      messageId: null,
      conversationId,
      name: safeName,
      originalName: entry.name,
      mimeType: entry.type,
      size: entry.size,
      path: relativePath,
      type: fileType,
      metadata: extractedText ? { extractedText } : null,
      direction: 'upload',
    });

    results.push(record);
  }

  return Response.json(results);
}
