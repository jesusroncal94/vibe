import { z } from 'zod';

export const fileTypeSchema = z.enum([
  'image',
  'pdf',
  'docx',
  'xlsx',
  'csv',
  'code',
  'text',
  'other',
]);

export const fileDirectionSchema = z.enum(['upload', 'generated']);

export const fileSchema = z.object({
  id: z.string(),
  messageId: z.string().nullable().optional(),
  conversationId: z.string().nullable().optional(),
  name: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string(),
  size: z.number().int().positive(),
  path: z.string(),
  type: fileTypeSchema,
  metadata: z.record(z.unknown()).nullable().optional(),
  direction: fileDirectionSchema,
  createdAt: z.date(),
});

export const createFileSchema = fileSchema.omit({
  id: true,
  createdAt: true,
});

export type File = z.infer<typeof fileSchema>;
export type CreateFile = z.infer<typeof createFileSchema>;
export type FileType = z.infer<typeof fileTypeSchema>;
export type FileDirection = z.infer<typeof fileDirectionSchema>;
