import { Packer } from 'docx';
import { marked } from 'marked';
import { logger } from '@/lib/logger';
import { createDocxDocument } from './markdown-to-docx';

export async function generateDocx(markdown: string): Promise<Buffer> {
  const doc = createDocxDocument(markdown);
  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

export async function generateXlsx(
  tableData: Array<{ headers: string[]; rows: string[][]; sheetName?: string }>,
): Promise<Buffer> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();

  for (const table of tableData) {
    const sheetName = table.sheetName ?? 'Sheet';
    const worksheet = workbook.addWorksheet(sheetName);

    // Header row
    const headerRow = worksheet.addRow(table.headers);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };
    });

    // Data rows
    for (const row of table.rows) {
      const dataRow = worksheet.addRow(row);
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }

    // Auto-width columns
    worksheet.columns.forEach((column) => {
      let maxWidth = 10;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const cellValue = cell.value ? String(cell.value) : '';
        maxWidth = Math.max(maxWidth, cellValue.length + 2);
      });
      column.width = Math.min(maxWidth, 50);
    });
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generatePdf(markdown: string): Promise<Buffer> {
  try {
    const html = await marked(markdown);
    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
            h1 { font-size: 24px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            h2 { font-size: 20px; }
            h3 { font-size: 16px; }
            code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 13px; }
            pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
            pre code { background: none; padding: 0; }
            blockquote { border-left: 3px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
            table { border-collapse: collapse; width: 100%; margin: 16px 0; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
            th { background: #f5f5f5; font-weight: 600; }
            img { max-width: 100%; }
            a { color: #0366d6; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `;

    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        printBackground: true,
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  } catch (err) {
    logger.error({ err }, 'Failed to generate PDF');
    throw err;
  }
}
