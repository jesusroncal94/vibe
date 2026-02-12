'use client';

import { useCallback, useState } from 'react';
import {
  Download,
  FileText,
  Image,
  FileSpreadsheet,
  FileCode,
  File,
  Eye,
  ScanSearch,
  PanelRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilePreviewDialog } from '@/components/files/file-preview-dialog';
import { useUiStore } from '@/lib/stores/ui-store';

interface FileMetadata {
  extractedText?: string;
  thumbnailPath?: string;
  width?: number;
  height?: number;
  pageCount?: number;
  html?: string;
  sheets?: Array<{ name: string; headers: string[]; rowCount: number; preview: string[][] }>;
  ocrText?: string;
  ocrConfidence?: number;
}

export interface FileAttachmentData {
  id: string;
  originalName: string;
  size: number;
  type: string;
  mimeType: string;
  metadata?: FileMetadata | null;
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

function SingleAttachment({ file, onPreview }: { file: FileAttachmentData; onPreview: () => void }) {
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrDone, setOcrDone] = useState(!!file.metadata?.ocrText);
  const openFilePanel = useUiStore((s) => s.openFilePanel);

  const isImage = file.type === 'image';
  const fileUrl = `/api/files/${file.id}`;
  const thumbnailUrl = isImage ? `/api/files/${file.id}/thumbnail` : undefined;

  const handleOcr = useCallback(async () => {
    setOcrLoading(true);
    try {
      const res = await fetch(`/api/files/${file.id}/ocr`, { method: 'POST' });
      if (res.ok) {
        setOcrDone(true);
      }
    } finally {
      setOcrLoading(false);
    }
  }, [file.id]);

  if (isImage) {
    return (
      <div className="group relative">
        <button type="button" onClick={onPreview} className="block cursor-pointer">
          <img
            src={thumbnailUrl ?? fileUrl}
            alt={file.originalName}
            className="max-h-48 rounded-lg border object-contain transition-opacity group-hover:opacity-90"
          />
        </button>
        <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6"
            onClick={() => openFilePanel(file.id)}
          >
            <PanelRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  const hasPdfNoText =
    file.type === 'pdf' && !file.metadata?.extractedText && !file.metadata?.ocrText && !ocrDone;
  const pageCount = file.metadata?.pageCount;
  const sheetCount = file.metadata?.sheets?.length;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-background/50 px-3 py-2">
      {fileIcon(file.type)}
      <div className="flex flex-col">
        <span className="max-w-[160px] truncate text-sm" title={file.originalName}>
          {file.originalName}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatSize(file.size)}
          {pageCount ? ` · ${pageCount} pages` : ''}
          {sheetCount ? ` · ${sheetCount} sheet${sheetCount > 1 ? 's' : ''}` : ''}
        </span>
      </div>
      {(file.type === 'pdf' || file.type === 'docx' || file.type === 'xlsx') && (
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onPreview} title="Preview">
          <Eye className="h-3 w-3" />
        </Button>
      )}
      {hasPdfNoText && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={handleOcr}
          disabled={ocrLoading}
          title="Run OCR"
        >
          {ocrLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ScanSearch className="h-3 w-3" />}
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" asChild>
        <a href={fileUrl} download={file.originalName}>
          <Download className="h-3 w-3" />
        </a>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={() => openFilePanel(file.id)}
        title="Open in panel"
      >
        <PanelRight className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function FileAttachment({ files }: FileAttachmentProps) {
  const [previewFile, setPreviewFile] = useState<FileAttachmentData | null>(null);

  if (files.length === 0) return null;

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        {files.map((file) => (
          <SingleAttachment key={file.id} file={file} onPreview={() => setPreviewFile(file)} />
        ))}
      </div>
      <FilePreviewDialog
        file={previewFile}
        open={previewFile !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null);
        }}
      />
    </>
  );
}
