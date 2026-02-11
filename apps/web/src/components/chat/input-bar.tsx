'use client';

import { useCallback, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { Send, Square, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileChip } from './file-chip';
import type { PendingFile } from '@/lib/stores/chat-store';

interface InputBarProps {
  isStreaming: boolean;
  isUploading: boolean;
  pendingFiles: PendingFile[];
  onSend: (message: string, fileIds: string[]) => void;
  onCancel: () => void;
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
}

export function InputBar({
  isStreaming,
  isUploading,
  pendingFiles,
  onSend,
  onCancel,
  onFilesSelected,
  onRemoveFile,
}: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const value = textarea.value.trim();
    if (!value || isStreaming || isUploading) return;
    const fileIds = pendingFiles.map((f) => f.id);
    onSend(value, fileIds);
    textarea.value = '';
    textarea.style.height = 'auto';
  }, [isStreaming, isUploading, pendingFiles, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData.items;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        onFilesSelected(imageFiles);
      }
    },
    [onFilesSelected],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFilesSelected(Array.from(files));
      }
      // Reset input so the same file can be selected again
      e.target.value = '';
    },
    [onFilesSelected],
  );

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto max-w-3xl">
        {pendingFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {pendingFiles.map((file) => (
              <FileChip key={file.id} file={file} onRemove={onRemoveFile} />
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 rounded-2xl border bg-card p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
          <textarea
            ref={textareaRef}
            placeholder="Send a message..."
            className="flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
            rows={1}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onPaste={handlePaste}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button
              variant="destructive"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl"
              onClick={onCancel}
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl"
              onClick={handleSend}
              disabled={isUploading}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Claude can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
