'use client';

import { useCallback } from 'react';
import { MessageList } from './message-list';
import { InputBar } from './input-bar';
import { EmptyState } from './empty-state';
import { useChatStream } from '@/lib/hooks/use-chat-stream';
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
  const { isStreaming, streamingContent, cancelStreaming } = useChatStore();
  const model = useUiStore((s) => s.model);

  const conversationQuery = useQuery(
    trpc.chat.get.queryOptions(
      { id: conversationId! },
      { enabled: !!conversationId },
    ),
  );

  const messages = conversationQuery.data?.messages ?? [];

  const handleSend = useCallback(
    (prompt: string) => {
      void sendMessage(conversationId, prompt, model);
    },
    [conversationId, model, sendMessage],
  );

  const handleSuggestionClick = useCallback(
    (prompt: string) => {
      void sendMessage(null, prompt, model);
    },
    [model, sendMessage],
  );

  const showEmptyState = !conversationId && messages.length === 0 && !isStreaming;

  return (
    <div className="flex h-full flex-col">
      {showEmptyState ? (
        <EmptyState onSuggestionClick={handleSuggestionClick} />
      ) : (
        <MessageList
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
        />
      )}
      <InputBar
        isStreaming={isStreaming}
        onSend={handleSend}
        onCancel={cancelStreaming}
      />
    </div>
  );
}
