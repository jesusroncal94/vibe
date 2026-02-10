'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUiStore } from '@/lib/stores/ui-store';
import { useChatStore } from '@/lib/stores/chat-store';

export function useKeyboardShortcuts() {
  const router = useRouter();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const cancelStreaming = useChatStore((s) => s.cancelStreaming);
  const isStreaming = useChatStore((s) => s.isStreaming);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+N — New chat
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        router.push('/chat');
      }

      // Ctrl+Shift+S — Toggle sidebar
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toggleSidebar();
      }

      // Escape — Cancel streaming
      if (e.key === 'Escape' && isStreaming) {
        e.preventDefault();
        cancelStreaming();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, toggleSidebar, cancelStreaming, isStreaming]);
}
