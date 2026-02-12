import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { createFile } from '@vibe/db';
import { sanitizeFileName } from '@/lib/file-utils';
import { generateDocx, generateXlsx, generatePdf } from '@/lib/server/document-generators';
import { logger } from '@/lib/logger';

function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
}

const generateSchema = z.object({
  type: z.enum(['docx', 'xlsx', 'pdf']),
  content: z.string().optional(),
  tableData: z
    .array(
      z.object({
        headers: z.array(z.string()),
        rows: z.array(z.array(z.string())),
        sheetName: z.string().optional(),
      }),
    )
    .optional(),
  filename: z.string().min(1),
  messageId: z.string().optional(),
  conversationId: z.string().optional(),
});

const MIME_TYPES: Record<string, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.message }, { status: 400 });
  }

  const { type, content, tableData, filename, messageId, conversationId } = parsed.data;

  let buffer: Buffer;
  try {
    switch (type) {
      case 'docx':
        buffer = await generateDocx(content ?? '');
        break;
      case 'xlsx':
        if (!tableData || tableData.length === 0) {
          return Response.json({ error: 'tableData required for xlsx' }, { status: 400 });
        }
        buffer = await generateXlsx(tableData);
        break;
      case 'pdf':
        buffer = await generatePdf(content ?? '');
        break;
    }
  } catch (err) {
    logger.error({ err, type }, 'Document generation failed');
    return Response.json({ error: 'Generation failed' }, { status: 500 });
  }

  const now = new Date();
  const monthDir = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const uploadDir = join(getUploadsDir(), monthDir);
  await mkdir(uploadDir, { recursive: true });

  const ext = type === 'docx' ? '.docx' : type === 'xlsx' ? '.xlsx' : '.pdf';
  const safeName = sanitizeFileName(filename.endsWith(ext) ? filename : `${filename}${ext}`);
  const filePath = join(uploadDir, safeName);
  const relativePath = join(monthDir, safeName);

  await writeFile(filePath, buffer);

  const mimeType = MIME_TYPES[type] ?? 'application/octet-stream';
  const fileType = type as 'docx' | 'xlsx' | 'pdf';

  const record = createFile({
    messageId: messageId ?? null,
    conversationId: conversationId ?? null,
    name: safeName,
    originalName: filename.endsWith(ext) ? filename : `${filename}${ext}`,
    mimeType,
    size: buffer.length,
    path: relativePath,
    type: fileType,
    direction: 'generated',
  });

  return Response.json(record);
}
