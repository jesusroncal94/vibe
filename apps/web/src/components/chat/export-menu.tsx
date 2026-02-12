'use client';

import { FileDown, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDocumentExport } from '@/lib/hooks/use-document-export';

interface ExportMenuProps {
  content: string;
  messageId?: string;
  conversationId?: string;
  hasTable?: boolean;
}

export function ExportMenu({ content, messageId, conversationId, hasTable }: ExportMenuProps) {
  const { exportDocument, isExporting } = useDocumentExport();

  const handleExport = (type: 'docx' | 'xlsx' | 'pdf') => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `export-${timestamp}`;
    void exportDocument(type, content, filename, { messageId, conversationId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground opacity-0 transition-opacity group-hover/msg:opacity-100"
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <FileDown className="h-3 w-3" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('docx')}>
          <FileText className="mr-2 h-4 w-4" />
          Export as DOCX
        </DropdownMenuItem>
        {hasTable && (
          <DropdownMenuItem onClick={() => handleExport('xlsx')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as XLSX
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
