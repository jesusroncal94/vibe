'use client';

import { useCallback, useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileDetails } from '@/components/files/file-details';
import { PdfPreviewLazy } from '@/components/files/pdf-preview-lazy';
import { XlsxPreview } from '@/components/files/xlsx-preview';
import { DocxPreview } from '@/components/files/docx-preview';
import { useUiStore } from '@/lib/stores/ui-store';
import { useTRPC } from '@/lib/trpc/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface FileRecord {
  id: string;
  type: string;
  originalName: string;
}

function InlinePreview({ file, meta }: { file: FileRecord; meta: Record<string, unknown> | null }) {
  const fileType = file.type;

  if (fileType === 'image') {
    return (
      <img
        src={`/api/files/${file.id}`}
        alt={file.originalName}
        className="w-full rounded-lg border object-contain"
      />
    );
  }
  if (fileType === 'pdf') {
    return <PdfPreviewLazy fileId={file.id} pageCount={meta?.pageCount as number | undefined} />;
  }
  if (fileType === 'xlsx' && meta?.sheets) {
    return (
      <XlsxPreview
        sheets={meta.sheets as Array<{ name: string; headers: string[]; preview: string[][] }>}
      />
    );
  }
  if (fileType === 'docx' && meta?.html) {
    return <DocxPreview html={meta.html as string} />;
  }
  if ((fileType === 'text' || fileType === 'code' || fileType === 'csv') && meta?.extractedText) {
    return (
      <div className="max-h-64 overflow-auto rounded-lg border bg-muted/50 p-3">
        <pre className="whitespace-pre-wrap text-xs">{meta.extractedText as string}</pre>
      </div>
    );
  }
  return null;
}

const MIN_WIDTH = 280;
const MAX_WIDTH = 600;

export function FilePanel() {
  const { filePanelOpen, filePanelFileId, filePanelWidth, closeFilePanel, setFilePanelWidth } =
    useUiStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const resizeRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const { data: file } = useQuery(
    trpc.files.get.queryOptions(
      { id: filePanelFileId! },
      { enabled: !!filePanelFileId && filePanelOpen },
    ),
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const startX = e.clientX;
      const startWidth = filePanelWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current) return;
        // Panel is on the right, so moving left increases width
        const delta = startX - moveEvent.clientX;
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
        setFilePanelWidth(newWidth);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [filePanelWidth, setFilePanelWidth],
  );

  const handleDelete = useCallback(async () => {
    if (!filePanelFileId) return;
    const res = await fetch('/api/files/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', fileIds: [filePanelFileId] }),
    });
    if (res.ok) {
      closeFilePanel();
      await queryClient.invalidateQueries({ queryKey: trpc.files.list.queryKey() });
      await queryClient.invalidateQueries({ queryKey: trpc.files.stats.queryKey() });
    }
  }, [filePanelFileId, closeFilePanel, queryClient, trpc]);

  // Close on Escape
  useEffect(() => {
    if (!filePanelOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFilePanel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filePanelOpen, closeFilePanel]);

  if (!filePanelOpen) return null;

  const meta = file?.metadata as Record<string, unknown> | null;

  return (
    <aside
      className="relative flex shrink-0 flex-col border-l bg-background"
      style={{ width: filePanelWidth }}
    >
      {/* Resize handle */}
      <div
        ref={resizeRef}
        className="absolute -left-1 inset-y-0 w-2 cursor-col-resize hover:bg-primary/10"
        onMouseDown={handleMouseDown}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="truncate text-sm font-semibold">
          {file?.originalName ?? 'File Details'}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => void handleDelete()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeFilePanel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {file ? (
            <div className="flex flex-col gap-4">
              <FileDetails
                id={file.id}
                originalName={file.originalName}
                type={file.type}
                mimeType={file.mimeType}
                size={file.size}
                direction={file.direction}
                conversationId={file.conversationId}
                createdAt={file.createdAt}
                metadata={meta}
              />

              <Separator />

              {/* Inline preview */}
              <InlinePreview file={file} meta={meta} />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              Loading...
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
