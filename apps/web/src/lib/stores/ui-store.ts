'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LayoutMode = 'focus' | 'minimal' | 'productivity';

interface UiState {
  sidebarOpen: boolean;
  layoutMode: LayoutMode;
  model: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setModel: (model: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      layoutMode: 'minimal',
      model: 'claude-sonnet-4-5',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setLayoutMode: (mode) =>
        set({
          layoutMode: mode,
          sidebarOpen: mode !== 'focus',
        }),
      setModel: (model) => set({ model }),
    }),
    {
      name: 'vibe-ui-store',
      skipHydration: true,
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        layoutMode: state.layoutMode,
        model: state.model,
      }),
    },
  ),
);

/**
 * Hook to rehydrate the persisted store after mount,
 * preventing SSR/client hydration mismatches.
 * Call once in a top-level client component (e.g. AppShell).
 */
export function useUiStoreHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useUiStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
}
