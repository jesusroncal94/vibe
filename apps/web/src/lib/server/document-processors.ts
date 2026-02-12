import { readFile } from 'node:fs/promises';
import { logger } from '@/lib/logger';

export async function extractPdfText(
  filePath: string,
): Promise<{ text: string; pageCount: number } | null> {
  try {
    const { PDFParse } = await import('pdf-parse') as unknown as {
      PDFParse: new () => {
        load: (path: string) => Promise<void>;
        getText: () => Promise<string>;
        getInfo: () => Promise<{ pages: number }>;
        destroy: () => void;
      };
    };
    const parser = new PDFParse();
    await parser.load(filePath);
    const [text, info] = await Promise.all([parser.getText(), parser.getInfo()]);
    parser.destroy();
    return { text, pageCount: info.pages };
  } catch (err) {
    logger.error({ err, filePath }, 'Failed to extract PDF text');
    return null;
  }
}

export async function extractDocxText(
  filePath: string,
): Promise<{ text: string; html: string } | null> {
  try {
    const mammoth = await import('mammoth');
    const buffer = await readFile(filePath);
    const [htmlResult, textResult] = await Promise.all([
      mammoth.convertToHtml({ buffer }),
      mammoth.extractRawText({ buffer }),
    ]);
    return { text: textResult.value, html: htmlResult.value };
  } catch (err) {
    logger.error({ err, filePath }, 'Failed to extract DOCX text');
    return null;
  }
}

export async function extractXlsxData(
  filePath: string,
): Promise<{
  sheets: Array<{
    name: string;
    headers: string[];
    rowCount: number;
    preview: string[][];
  }>;
} | null> {
  try {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheets: Array<{
      name: string;
      headers: string[];
      rowCount: number;
      preview: string[][];
    }> = [];

    workbook.eachSheet((worksheet) => {
      const headers: string[] = [];
      const preview: string[][] = [];
      let rowCount = 0;

      worksheet.eachRow((row, rowNumber) => {
        rowCount++;
        const values = row.values as (string | number | boolean | null | undefined)[];
        // row.values is 1-indexed, skip index 0
        const cells = values.slice(1).map((v) => (v != null ? String(v) : ''));

        if (rowNumber === 1) {
          headers.push(...cells);
        }
        if (rowNumber <= 51) {
          // first 50 data rows + header
          preview.push(cells);
        }
      });

      sheets.push({
        name: worksheet.name,
        headers,
        rowCount: Math.max(0, rowCount - 1), // exclude header
        preview,
      });
    });

    return { sheets };
  } catch (err) {
    logger.error({ err, filePath }, 'Failed to extract XLSX data');
    return null;
  }
}

export async function generateThumbnail(
  filePath: string,
  outputPath: string,
  opts?: { maxWidth?: number },
): Promise<{ width: number; height: number } | null> {
  try {
    const sharp = (await import('sharp')).default;
    const maxWidth = opts?.maxWidth ?? 400;
    const result = await sharp(filePath)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
    return { width: result.width, height: result.height };
  } catch (err) {
    logger.error({ err, filePath }, 'Failed to generate thumbnail');
    return null;
  }
}

export async function runOcr(
  filePath: string,
): Promise<{ text: string; confidence: number } | null> {
  try {
    const Tesseract = await import('tesseract.js');
    const worker = await Tesseract.createWorker('eng');
    const {
      data: { text, confidence },
    } = await worker.recognize(filePath);
    await worker.terminate();
    return { text, confidence };
  } catch (err) {
    logger.error({ err, filePath }, 'Failed to run OCR');
    return null;
  }
}
