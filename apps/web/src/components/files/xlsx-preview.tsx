'use client';

import { useCallback, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface XlsxSheet {
  name: string;
  headers: string[];
  preview: string[][];
}

interface XlsxPreviewProps {
  sheets: XlsxSheet[];
}

export function XlsxPreview({ sheets }: XlsxPreviewProps) {
  const [activeSheet, setActiveSheet] = useState(0);
  const sheet = sheets[activeSheet];

  const handleDownloadCsv = useCallback(() => {
    if (!sheet) return;
    const rows = sheet.preview.map((row) =>
      row
        .map((cell) => {
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(','),
    );
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sheet.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sheet]);

  if (sheets.length === 0) {
    return <p className="text-sm text-muted-foreground">No sheets found</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {sheets.length > 1 && (
        <div className="flex gap-1 overflow-x-auto border-b pb-1">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setActiveSheet(i)}
              className={cn(
                'shrink-0 rounded-t px-3 py-1.5 text-xs transition-colors',
                i === activeSheet
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {sheet && (
        <>
          <div className="max-h-96 overflow-auto rounded-lg border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {sheet.headers.map((header, i) => (
                    <th
                      key={i}
                      className="sticky top-0 border border-border/50 bg-muted px-3 py-1.5 text-left font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sheet.preview.slice(1).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border border-border/50 px-3 py-1.5">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="ghost" size="sm" className="self-start gap-2" onClick={handleDownloadCsv}>
            <Download className="h-3 w-3" />
            Download CSV
          </Button>
        </>
      )}
    </div>
  );
}
