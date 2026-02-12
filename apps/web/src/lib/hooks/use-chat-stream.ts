'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/lib/stores/chat-store';
import { useTRPC } from '@/lib/trpc/react';
import { useQueryClient } from '@tanstack/react-query';

interface StreamEvent {
  type: 'init' | 'text' | 'error' | 'done';
  content?: string;
  conversationId?: string;
}

export function useChatStream() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { startStreaming, appendStreamContent, stopStreaming } = useChatStore();

  const sendMessage = useCallback(
    async (conversationId: string | null, prompt: string, model?: string, fileIds?: string[], internetAccess?: boolean) => {
      const abortController = new AbortController();
      startStreaming(abortController);

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, prompt, model, fileIds, internetAccess }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          stopStreaming();
          throw new Error(`Stream request failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          stopStreaming();
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let newConversationId: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);

            let event: StreamEvent;
            try {
              event = JSON.parse(data) as StreamEvent;
            } catch {
              continue;
            }

            switch (event.type) {
              case 'init':
                newConversationId = event.conversationId ?? null;
                if (newConversationId && !conversationId) {
                  router.push(`/chat/${newConversationId}`);
                }
                break;
              case 'text':
                if (event.content) {
                  appendStreamContent(event.content);
                }
                break;
              case 'done':
                break;
              case 'error':
                break;
            }
          }
        }

        stopStreaming();

        // Invalidate queries to sync with DB
        await queryClient.invalidateQueries({ queryKey: trpc.chat.list.queryKey() });
        if (newConversationId ?? conversationId) {
          await queryClient.invalidateQueries({
            queryKey: trpc.chat.get.queryKey({ id: (newConversationId ?? conversationId)! }),
          });
        }
      } catch (err) {
        stopStreaming();
        if (err instanceof DOMException && err.name === 'AbortError') {
          // User cancelled — invalidate to sync partial response
          await queryClient.invalidateQueries({ queryKey: trpc.chat.list.queryKey() });
          return;
        }
        throw err;
      }
    },
    [router, startStreaming, appendStreamContent, stopStreaming, queryClient, trpc],
  );

  return { sendMessage };
}
