'use client';

import { X, FileText, Image, FileSpreadsheet, FileCode, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PendingFile } from '@/lib/stores/chat-store';

interface FileChipProps {
  file: PendingFile;
  onRemove: (id: string) => void;
}

function fileIcon(type: string) {
  switch (type) {
    case 'image':
      return <Image className="h-4 w-4 shrink-0" />;
    case 'csv':
    case 'xlsx':
      return <FileSpreadsheet className="h-4 w-4 shrink-0" />;
    case 'code':
      return <FileCode className="h-4 w-4 shrink-0" />;
    case 'text':
    case 'pdf':
    case 'docx':
      return <FileText className="h-4 w-4 shrink-0" />;
    default:
      return <File className="h-4 w-4 shrink-0" />;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileChip({ file, onRemove }: FileChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm">
      {file.previewUrl ? (
        <img
          src={file.previewUrl}
          alt={file.originalName}
          className="h-8 w-8 shrink-0 rounded object-cover"
        />
      ) : (
        fileIcon(file.type)
      )}
      <span className="max-w-[120px] truncate" title={file.originalName}>
        {file.originalName}
      </span>
      <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 shrink-0 rounded-full"
        onClick={() => onRemove(file.id)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
