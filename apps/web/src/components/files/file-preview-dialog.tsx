'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PdfPreviewLazy } from './pdf-preview-lazy';
import { XlsxPreview } from './xlsx-preview';
import { DocxPreview } from './docx-preview';

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

interface FileData {
  id: string;
  originalName: string;
  size: number;
  type: string;
  mimeType: string;
  metadata?: FileMetadata | null;
}

interface FilePreviewDialogProps {
  file: FileData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PreviewContent({ file }: { file: FileData }) {
  const fileUrl = `/api/files/${file.id}`;

  switch (file.type) {
    case 'image':
      return (
        <div className="flex justify-center">
          <img
            src={fileUrl}
            alt={file.originalName}
            className="max-h-[70vh] rounded-lg object-contain"
          />
        </div>
      );

    case 'pdf':
      return <PdfPreviewLazy fileId={file.id} pageCount={file.metadata?.pageCount} />;

    case 'xlsx':
      if (file.metadata?.sheets) {
        return <XlsxPreview sheets={file.metadata.sheets} />;
      }
      return <p className="text-sm text-muted-foreground">No preview available</p>;

    case 'docx':
      if (file.metadata?.html) {
        return <DocxPreview html={file.metadata.html} />;
      }
      if (file.metadata?.extractedText) {
        return (
          <div className="max-h-96 overflow-auto rounded-lg border bg-background p-4">
            <pre className="whitespace-pre-wrap text-sm">{file.metadata.extractedText}</pre>
          </div>
        );
      }
      return <p className="text-sm text-muted-foreground">No preview available</p>;

    default:
      if (file.metadata?.extractedText) {
        return (
          <div className="max-h-96 overflow-auto rounded-lg border bg-background p-4">
            <pre className="whitespace-pre-wrap text-sm">{file.metadata.extractedText}</pre>
          </div>
        );
      }
      return <p className="text-sm text-muted-foreground">No preview available for this file type</p>;
  }
}

export function FilePreviewDialog({ file, open, onOpenChange }: FilePreviewDialogProps) {
  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="truncate">{file.originalName}</DialogTitle>
          <DialogDescription>Preview</DialogDescription>
        </DialogHeader>
        <PreviewContent file={file} />
      </DialogContent>
    </Dialog>
  );
}
