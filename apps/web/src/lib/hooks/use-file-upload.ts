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

function xhrUpload(
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<UploadedFileResponse[]> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/files/upload');

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as UploadedFileResponse[]);
      } else {
        try {
          const err = JSON.parse(xhr.responseText) as { error: string };
          reject(new Error(err.error));
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.send(formData);
  });
}

export function useFileUpload(conversationId: string | null) {
  const { addPendingFile, pendingFiles, setUploadingCount, setUploadProgress, clearUploadProgress } =
    useChatStore();

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
      setUploadProgress('batch', 0);

      try {
        const formData = new FormData();
        if (conversationId) {
          formData.append('conversationId', conversationId);
        }
        for (const file of filesToUpload) {
          formData.append('files', file);
        }

        const results = await xhrUpload(formData, (percent) => {
          setUploadProgress('batch', percent);
        });

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
        clearUploadProgress();
      }
    },
    [conversationId, pendingFiles.length, addPendingFile, setUploadingCount, setUploadProgress, clearUploadProgress],
  );

  return { uploadFiles, isUploading: useChatStore((s) => s.uploadingCount > 0) };
}
