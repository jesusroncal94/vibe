'use client';

import { useCallback, useState } from 'react';

interface ExportOptions {
  messageId?: string;
  conversationId?: string;
  tableData?: Array<{ headers: string[]; rows: string[][]; sheetName?: string }>;
}

interface ExportResult {
  fileId: string;
  downloadUrl: string;
}

export function useDocumentExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportDocument = useCallback(
    async (
      type: 'docx' | 'xlsx' | 'pdf',
      content: string,
      filename: string,
      options?: ExportOptions,
    ): Promise<ExportResult | null> => {
      setIsExporting(true);
      try {
        const response = await fetch('/api/files/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            content: type !== 'xlsx' ? content : undefined,
            tableData: options?.tableData,
            filename,
            messageId: options?.messageId,
            conversationId: options?.conversationId,
          }),
        });

        if (!response.ok) {
          return null;
        }

        const result = (await response.json()) as { id: string };
        const downloadUrl = `/api/files/${result.id}`;

        // Trigger download
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        a.click();

        return { fileId: result.id, downloadUrl };
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return { exportDocument, isExporting };
}
