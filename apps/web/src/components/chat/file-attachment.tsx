'use client';

import { Download, FileText, Image, FileSpreadsheet, FileCode, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FileAttachmentData {
  id: string;
  originalName: string;
  size: number;
  type: string;
  mimeType: string;
}

interface FileAttachmentProps {
  files: FileAttachmentData[];
}

function fileIcon(type: string) {
  switch (type) {
    case 'image':
      return <Image className="h-4 w-4 shrink-0 text-blue-400" />;
    case 'csv':
    case 'xlsx':
      return <FileSpreadsheet className="h-4 w-4 shrink-0 text-green-400" />;
    case 'code':
      return <FileCode className="h-4 w-4 shrink-0 text-yellow-400" />;
    case 'text':
    case 'pdf':
    case 'docx':
      return <FileText className="h-4 w-4 shrink-0 text-orange-400" />;
    default:
      return <File className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SingleAttachment({ file }: { file: FileAttachmentData }) {
  const isImage = file.type === 'image';
  const fileUrl = `/api/files/${file.id}`;

  if (isImage) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={fileUrl}
          alt={file.originalName}
          className="max-h-48 rounded-lg border object-contain"
        />
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-background/50 px-3 py-2">
      {fileIcon(file.type)}
      <span className="max-w-[160px] truncate text-sm" title={file.originalName}>
        {file.originalName}
      </span>
      <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" asChild>
        <a href={fileUrl} download={file.originalName}>
          <Download className="h-3 w-3" />
        </a>
      </Button>
    </div>
  );
}

export function FileAttachment({ files }: FileAttachmentProps) {
  if (files.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {files.map((file) => (
        <SingleAttachment key={file.id} file={file} />
      ))}
    </div>
  );
}
