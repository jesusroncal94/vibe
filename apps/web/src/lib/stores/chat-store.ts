'use client';

import { create } from 'zustand';

export interface PendingFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  mimeType: string;
  previewUrl?: string;
}

interface ChatState {
  activeConversationId: string | null;
  isStreaming: boolean;
  streamingContent: string;
  abortController: AbortController | null;
  pendingFiles: PendingFile[];
  uploadingCount: number;
  uploadProgress: Record<string, number>;
  setActiveConversation: (id: string | null) => void;
  startStreaming: (abortController: AbortController) => void;
  appendStreamContent: (content: string) => void;
  stopStreaming: () => void;
  cancelStreaming: () => void;
  addPendingFile: (file: PendingFile) => void;
  removePendingFile: (id: string) => void;
  clearPendingFiles: () => void;
  setUploadingCount: (count: number) => void;
  setUploadProgress: (fileKey: string, progress: number) => void;
  clearUploadProgress: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  activeConversationId: null,
  isStreaming: false,
  streamingContent: '',
  abortController: null,
  pendingFiles: [],
  uploadingCount: 0,
  uploadProgress: {},

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

  addPendingFile: (file) =>
    set((state) => ({ pendingFiles: [...state.pendingFiles, file] })),

  removePendingFile: (id) =>
    set((state) => ({
      pendingFiles: state.pendingFiles.filter((f) => f.id !== id),
    })),

  clearPendingFiles: () => set({ pendingFiles: [] }),

  setUploadingCount: (count) => set({ uploadingCount: count }),

  setUploadProgress: (fileKey, progress) =>
    set((state) => ({
      uploadProgress: { ...state.uploadProgress, [fileKey]: progress },
    })),

  clearUploadProgress: () => set({ uploadProgress: {} }),
}));
