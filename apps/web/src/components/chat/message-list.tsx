'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';
import { ThinkingIndicator } from './thinking-indicator';
import type { FileAttachmentData } from './file-attachment';

interface MessageData {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  files?: FileAttachmentData[];
}

interface MessageListProps {
  messages: MessageData[];
  streamingContent: string;
  isStreaming: boolean;
  conversationId?: string;
}

export function MessageList({ messages, streamingContent, isStreaming, conversationId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl py-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            files={msg.files}
            messageId={msg.id}
            conversationId={conversationId}
          />
        ))}

        {isStreaming && streamingContent && (
          <MessageBubble role="assistant" content={streamingContent} isStreaming />
        )}

        {isStreaming && !streamingContent && <ThinkingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
