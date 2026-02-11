'use client';

import { useCallback } from 'react';
import { useChatStore } from '@/lib/stores/chat-store';
import type { PendingFile } from '@/lib/stores/chat-store';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

interface UploadedFileResponse {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  mimeType: string;
}

export function useFileUpload(conversationId: string | null) {
  const { addPendingFile, pendingFiles, setUploadingCount } = useChatStore();

  const uploadFiles = useCallback(
    async (fileList: File[]) => {
      const remaining = MAX_FILES - pendingFiles.length;
      if (remaining <= 0) return;

      const filesToUpload = fileList.slice(0, remaining);
      const oversized = filesToUpload.find((f) => f.size > MAX_SIZE);
      if (oversized) {
        throw new Error(`File "${oversized.name}" exceeds 10MB limit`);
      }

      setUploadingCount(filesToUpload.length);

      try {
        const formData = new FormData();
        if (conversationId) {
          formData.append('conversationId', conversationId);
        }
        for (const file of filesToUpload) {
          formData.append('files', file);
        }

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const err = (await response.json()) as { error: string };
          throw new Error(err.error);
        }

        const results = (await response.json()) as UploadedFileResponse[];

        for (let i = 0; i < results.length; i++) {
          const result = results[i]!;
          const originalFile = filesToUpload[i];

          const pending: PendingFile = {
            id: result.id,
            name: result.name,
            originalName: result.originalName,
            size: result.size,
            type: result.type,
            mimeType: result.mimeType,
          };

          if (originalFile && originalFile.type.startsWith('image/')) {
            pending.previewUrl = URL.createObjectURL(originalFile);
          }

          addPendingFile(pending);
        }
      } finally {
        setUploadingCount(0);
      }
    },
    [conversationId, pendingFiles.length, addPendingFile, setUploadingCount],
  );

  return { uploadFiles, isUploading: useChatStore((s) => s.uploadingCount > 0) };
}
