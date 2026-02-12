'use client';

import { useRouter } from 'next/navigation';
import { FileText, Image, FileSpreadsheet, FileCode, File, Check, Download, Trash2, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';

interface FileRow {
  id: string;
  originalName: string;
  type: string;
  size: number;
  mimeType: string;
  direction: string;
  conversationId: string | null;
  createdAt: Date;
}

interface FileListViewProps {
  files: FileRow[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
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

function fileIcon(type: string) {
  const cls = 'h-4 w-4 shrink-0';
  switch (type) {
    case 'image':
      return <Image className={cn(cls, 'text-blue-400')} />;
    case 'csv':
    case 'xlsx':
      return <FileSpreadsheet className={cn(cls, 'text-green-400')} />;
    case 'code':
      return <FileCode className={cn(cls, 'text-yellow-400')} />;
    case 'text':
    case 'pdf':
    case 'docx':
      return <FileText className={cn(cls, 'text-orange-400')} />;
    default:
      return <File className={cn(cls, 'text-muted-foreground')} />;
  }
}

export function FileListView({ files, selectedIds, onSelect, onClick, onDelete }: FileListViewProps) {
  const router = useRouter();
  const addPendingFile = useChatStore((s) => s.addPendingFile);

  const handleUseInChat = (file: FileRow) => {
    addPendingFile({
      id: file.id,
      name: file.originalName,
      originalName: file.originalName,
      size: file.size,
      type: file.type,
      mimeType: file.mimeType,
    });
    router.push('/chat');
  };

  return (
    <div className="overflow-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-8 px-3 py-2" />
            <th className="px-3 py-2 text-left font-medium">Name</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-left font-medium">Size</th>
            <th className="px-3 py-2 text-left font-medium">Direction</th>
            <th className="px-3 py-2 text-left font-medium">Date</th>
            <th className="w-20 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const selected = selectedIds.has(file.id);
            return (
              <tr
                key={file.id}
                className={cn(
                  'border-b transition-colors hover:bg-muted/30',
                  selected && 'bg-primary/5',
                )}
              >
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded border',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30',
                    )}
                    onClick={() => onSelect(file.id)}
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 hover:text-primary"
                    onClick={() => onClick(file.id)}
                  >
                    {fileIcon(file.type)}
                    <span className="max-w-[200px] truncate">{file.originalName}</span>
                  </button>
                </td>
                <td className="px-3 py-2 capitalize text-muted-foreground">{file.type}</td>
                <td className="px-3 py-2 text-muted-foreground">{formatSize(file.size)}</td>
                <td className="px-3 py-2 capitalize text-muted-foreground">{file.direction}</td>
                <td className="px-3 py-2 text-muted-foreground">{formatDate(file.createdAt)}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleUseInChat(file)}
                      title="Use in chat"
                    >
                      <MessageSquarePlus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                      <a href={`/api/files/${file.id}`} download={file.originalName}>
                        <Download className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => onDelete(file.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
