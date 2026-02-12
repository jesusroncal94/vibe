'use client';

import { useRouter } from 'next/navigation';
import { MessageSquarePlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PdfPreviewLazy } from './pdf-preview-lazy';
import { XlsxPreview } from './xlsx-preview';
import { DocxPreview } from './docx-preview';
import { useChatStore } from '@/lib/stores/chat-store';

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
  const router = useRouter();
  const addPendingFile = useChatStore((s) => s.addPendingFile);

  if (!file) return null;

  const handleUseInChat = () => {
    addPendingFile({
      id: file.id,
      name: file.originalName,
      originalName: file.originalName,
      size: file.size,
      type: file.type,
      mimeType: file.mimeType,
    });
    onOpenChange(false);
    router.push('/chat');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 pr-8">
            <div className="min-w-0">
              <DialogTitle className="truncate">{file.originalName}</DialogTitle>
              <DialogDescription>Preview</DialogDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5"
              onClick={handleUseInChat}
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              Use in chat
            </Button>
          </div>
        </DialogHeader>
        <PreviewContent file={file} />
      </DialogContent>
    </Dialog>
  );
}
