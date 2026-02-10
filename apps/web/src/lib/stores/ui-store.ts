'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LayoutMode = 'focus' | 'minimal' | 'productivity';

interface UiState {
  sidebarOpen: boolean;
  layoutMode: LayoutMode;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      layoutMode: 'minimal',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setLayoutMode: (mode) =>
        set({
          layoutMode: mode,
          sidebarOpen: mode !== 'focus',
        }),
    }),
    {
      name: 'vibe-ui-store',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        layoutMode: state.layoutMode,
      }),
    },
  ),
);
