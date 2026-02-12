import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createFile } from '@vibe/db';
import {
  classifyFileType,
  sanitizeFileName,
  extractTextContent,
  FILE_LIMITS,
} from '@/lib/file-utils';
import {
  extractPdfText,
  extractDocxText,
  extractXlsxData,
  generateThumbnail,
} from '@/lib/server/document-processors';
import { logger } from '@/lib/logger';

function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
}

async function processDocument(
  filePath: string,
  fileType: string,
  monthDir: string,
  safeName: string,
): Promise<Record<string, unknown> | null> {
  const uploadsDir = getUploadsDir();

  switch (fileType) {
    case 'image': {
      const thumbName = `thumb_${safeName.replace(/\.[^.]+$/, '.jpg')}`;
      const thumbPath = join(uploadsDir, monthDir, thumbName);
      const thumbRelative = join(monthDir, thumbName);
      const result = await generateThumbnail(filePath, thumbPath);
      if (result) {
        return { thumbnailPath: thumbRelative, width: result.width, height: result.height };
      }
      return null;
    }
    case 'pdf': {
      const result = await extractPdfText(filePath);
      if (result) {
        return { extractedText: result.text, pageCount: result.pageCount };
      }
      return null;
    }
    case 'docx': {
      const result = await extractDocxText(filePath);
      if (result) {
        return { extractedText: result.text, html: result.html };
      }
      return null;
    }
    case 'xlsx': {
      const result = await extractXlsxData(filePath);
      if (result) {
        return { sheets: result.sheets };
      }
      return null;
    }
    default:
      return null;
  }
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

    // Text-based extraction (text/code/csv)
    const extractedText = await extractTextContent(filePath, entry.type, fileType);

    // Rich document processing (images, PDFs, DOCX, XLSX)
    let docMetadata: Record<string, unknown> | null = null;
    try {
      docMetadata = await processDocument(filePath, fileType, monthDir, safeName);
    } catch (err) {
      logger.error({ err, fileType, filePath }, 'Document processing failed');
    }

    const metadata: Record<string, unknown> = {};
    if (extractedText) metadata.extractedText = extractedText;
    if (docMetadata) Object.assign(metadata, docMetadata);

    const record = createFile({
      messageId: null,
      conversationId,
      name: safeName,
      originalName: entry.name,
      mimeType: entry.type,
      size: entry.size,
      path: relativePath,
      type: fileType,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
      direction: 'upload',
    });

    results.push(record);
  }

  return Response.json(results);
}
