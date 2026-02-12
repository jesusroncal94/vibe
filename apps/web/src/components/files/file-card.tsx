'use client';

import { useRouter } from 'next/navigation';
import { FileText, Image, FileSpreadsheet, FileCode, FileArchive, File, Check, MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';

interface FileCardProps {
  id: string;
  originalName: string;
  type: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  selected: boolean;
  onSelect: (id: string) => void;
  onClick: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function FileTypeIcon({ type }: { type: string }) {
  const className = 'h-8 w-8';
  switch (type) {
    case 'image':
      return <Image className={cn(className, 'text-blue-400')} />;
    case 'csv':
    case 'xlsx':
      return <FileSpreadsheet className={cn(className, 'text-green-400')} />;
    case 'code':
      return <FileCode className={cn(className, 'text-yellow-400')} />;
    case 'zip':
      return <FileArchive className={cn(className, 'text-purple-400')} />;
    case 'text':
    case 'pdf':
    case 'docx':
      return <FileText className={cn(className, 'text-orange-400')} />;
    default:
      return <File className={cn(className, 'text-muted-foreground')} />;
  }
}

export function FileCard({ id, originalName, type, mimeType, size, createdAt, selected, onSelect, onClick }: FileCardProps) {
  const router = useRouter();
  const addPendingFile = useChatStore((s) => s.addPendingFile);
  const isImage = type === 'image';
  const thumbnailUrl = isImage ? `/api/files/${id}/thumbnail` : undefined;

  const handleUseInChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    addPendingFile({ id, name: originalName, originalName, size, type, mimeType });
    router.push('/chat');
  };

  const handleDragStart = (e: React.DragEvent) => {
    const payload = JSON.stringify({ id, name: originalName, originalName, size, type, mimeType });
    e.dataTransfer.setData('application/x-vibe-file', payload);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border transition-colors hover:border-primary/50 cursor-grab active:cursor-grabbing',
        selected && 'border-primary ring-1 ring-primary',
      )}
    >
      <button
        type="button"
        className={cn(
          'absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded border transition-colors',
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground/30 bg-background opacity-0 group-hover:opacity-100',
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
      >
        {selected && <Check className="h-3 w-3" />}
      </button>

      <button
        type="button"
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded bg-background/80 border opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground"
        onClick={handleUseInChat}
        title="Use in chat"
      >
        <MessageSquarePlus className="h-3 w-3" />
      </button>

      <button
        type="button"
        className="flex flex-1 flex-col items-center justify-center p-4 pt-8"
        onClick={() => onClick(id)}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={originalName}
            className="h-24 w-full rounded object-contain"
          />
        ) : (
          <FileTypeIcon type={type} />
        )}
      </button>

      <div className="border-t px-3 py-2">
        <p className="truncate text-sm font-medium" title={originalName}>
          {originalName}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatSize(size)} · {formatDate(createdAt)}
        </p>
      </div>
    </div>
  );
}
