'use client';

import { create } from 'zustand';

interface ChatState {
  activeConversationId: string | null;
  isStreaming: boolean;
  streamingContent: string;
  abortController: AbortController | null;
  setActiveConversation: (id: string | null) => void;
  startStreaming: (abortController: AbortController) => void;
  appendStreamContent: (content: string) => void;
  stopStreaming: () => void;
  cancelStreaming: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  activeConversationId: null,
  isStreaming: false,
  streamingContent: '',
  abortController: null,

  setActiveConversation: (id) => set({ activeConversationId: id }),

  startStreaming: (abortController) =>
    set({
      isStreaming: true,
      streamingContent: '',
      abortController,
    }),

  appendStreamContent: (content) =>
    set((state) => ({
      streamingContent: state.streamingContent + content,
    })),

  stopStreaming: () =>
    set({
      isStreaming: false,
      abortController: null,
    }),

  cancelStreaming: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({
      isStreaming: false,
      abortController: null,
    });
  },
}));
