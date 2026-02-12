import { z } from 'zod';

export const imageMetadataSchema = z.object({
  extractedText: z.string().optional(),
  thumbnailPath: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const pdfMetadataSchema = z.object({
  extractedText: z.string().optional(),
  pageCount: z.number().optional(),
  ocrText: z.string().optional(),
  ocrConfidence: z.number().optional(),
});

export const docxMetadataSchema = z.object({
  extractedText: z.string().optional(),
  html: z.string().optional(),
});

export const xlsxSheetSchema = z.object({
  name: z.string(),
  headers: z.array(z.string()),
  rowCount: z.number(),
  preview: z.array(z.array(z.string())),
});

export const xlsxMetadataSchema = z.object({
  sheets: z.array(xlsxSheetSchema),
});

export type ImageMetadata = z.infer<typeof imageMetadataSchema>;
export type PdfMetadata = z.infer<typeof pdfMetadataSchema>;
export type DocxMetadata = z.infer<typeof docxMetadataSchema>;
export type XlsxSheet = z.infer<typeof xlsxSheetSchema>;
export type XlsxMetadata = z.infer<typeof xlsxMetadataSchema>;
