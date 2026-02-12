import { readFile } from 'node:fs/promises';
import type { FileType } from '@vibe/shared';
import { generateId } from '@vibe/shared';

export const FILE_LIMITS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  maxExtractedText: 100 * 1024, // 100KB
} as const;

export const ACCEPTED_MIME_TYPES: Record<string, string[]> = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
  'text/*': ['.txt', '.md', '.csv', '.log', '.json', '.xml', '.yaml', '.yml'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.rb', '.go', '.rs', '.java',
  '.c', '.cpp', '.h', '.hpp', '.cs', '.swift', '.kt', '.scala',
  '.sh', '.bash', '.zsh', '.fish', '.ps1',
  '.html', '.css', '.scss', '.less', '.vue', '.svelte',
  '.sql', '.graphql', '.gql',
  '.toml', '.ini', '.env', '.dockerfile',
  '.r', '.lua', '.perl', '.php',
]);

export function classifyFileType(mimeType: string, fileName: string): FileType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx';
  if (mimeType === 'text/csv') return 'csv';
  if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') return 'zip';

  const ext = '.' + fileName.split('.').pop()?.toLowerCase();
  if (ext === '.csv') return 'csv';
  if (ext === '.zip') return 'zip';
  if (CODE_EXTENSIONS.has(ext)) return 'code';
  if (mimeType.startsWith('text/') || mimeType === 'application/json') return 'text';

  return 'other';
}

export function sanitizeFileName(originalName: string): string {
  const cleaned = originalName
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 200);
  const prefix = generateId().slice(0, 8);
  return `${prefix}_${cleaned}`;
}

export async function extractTextContent(
  filePath: string,
  _mimeType: string,
  fileType: FileType,
): Promise<string | null> {
  const textTypes: FileType[] = ['text', 'code', 'csv'];
  if (!textTypes.includes(fileType)) return null;

  const buffer = await readFile(filePath);
  const text = buffer.toString('utf-8');
  if (text.length > FILE_LIMITS.maxExtractedText) {
    return text.slice(0, FILE_LIMITS.maxExtractedText) + '\n... [truncated]';
  }
  return text;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
