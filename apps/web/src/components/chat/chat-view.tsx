'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { MessageList } from './message-list';
import { InputBar } from './input-bar';
import { EmptyState } from './empty-state';
import { useChatStream } from '@/lib/hooks/use-chat-stream';
import { useFileUpload } from '@/lib/hooks/use-file-upload';
import { useChatStore } from '@/lib/stores/chat-store';
import { useUiStore } from '@/lib/stores/ui-store';
import { useTRPC } from '@/lib/trpc/react';
import { useQuery } from '@tanstack/react-query';

interface ChatViewProps {
  conversationId: string | null;
}

export function ChatView({ conversationId }: ChatViewProps) {
  const trpc = useTRPC();
  const { sendMessage } = useChatStream();
  const { isStreaming, streamingContent, cancelStreaming, pendingFiles, removePendingFile, clearPendingFiles } =
    useChatStore();
  const model = useUiStore((s) => s.model);
  const internetAccess = useUiStore((s) => s.internetAccess);
  const { uploadFiles, isUploading } = useFileUpload(conversationId);

  const conversationQuery = useQuery(
    trpc.chat.get.queryOptions(
      { id: conversationId! },
      { enabled: !!conversationId },
    ),
  );

  const messages = conversationQuery.data?.messages ?? [];

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      void uploadFiles(files);
    },
    [uploadFiles],
  );

  const handleSend = useCallback(
    (prompt: string, fileIds: string[]) => {
      clearPendingFiles();
      void sendMessage(conversationId, prompt, model, fileIds, internetAccess);
    },
    [conversationId, model, internetAccess, sendMessage, clearPendingFiles],
  );

  const handleSuggestionClick = useCallback(
    (prompt: string) => {
      void sendMessage(null, prompt, model, undefined, internetAccess);
    },
    [model, internetAccess, sendMessage],
  );

  const { getRootProps, isDragActive } = useDropzone({
    onDrop: handleFilesSelected,
    noClick: true,
    noKeyboard: true,
  });

  const showEmptyState = !conversationId && messages.length === 0 && !isStreaming;

  return (
    <div {...getRootProps()} className="relative flex h-full flex-col">
      {isDragActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary p-12">
            <Upload className="h-10 w-10 text-primary" />
            <p className="text-lg font-medium">Drop files here</p>
            <p className="text-sm text-muted-foreground">Maximum 10MB per file, up to 5 files</p>
          </div>
        </div>
      )}

      {showEmptyState ? (
        <EmptyState onSuggestionClick={handleSuggestionClick} />
      ) : (
        <MessageList
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
          conversationId={conversationId ?? undefined}
        />
      )}
      <InputBar
        isStreaming={isStreaming}
        isUploading={isUploading}
        pendingFiles={pendingFiles}
        onSend={handleSend}
        onCancel={cancelStreaming}
        onFilesSelected={handleFilesSelected}
        onRemoveFile={removePendingFile}
      />
    </div>
  );
}
