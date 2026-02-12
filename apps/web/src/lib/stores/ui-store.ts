'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LayoutMode = 'focus' | 'minimal' | 'productivity';
type FontSize = 'small' | 'normal' | 'large';

interface UiState {
  sidebarOpen: boolean;
  layoutMode: LayoutMode;
  sidebarWidth: number;
  fontSize: FontSize;
  model: string;
  internetAccess: boolean;
  disabledTools: string[];
  filePanelOpen: boolean;
  filePanelFileId: string | null;
  filePanelWidth: number;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setSidebarWidth: (width: number) => void;
  setFontSize: (size: FontSize) => void;
  setModel: (model: string) => void;
  setInternetAccess: (enabled: boolean) => void;
  setToolEnabled: (tool: string, enabled: boolean) => void;
  openFilePanel: (fileId: string) => void;
  closeFilePanel: () => void;
  setFilePanelWidth: (width: number) => void;
}

const DEFAULT_WIDTHS: Record<LayoutMode, number> = {
  focus: 0,
  minimal: 256,
  productivity: 320,
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      layoutMode: 'minimal',
      sidebarWidth: DEFAULT_WIDTHS.minimal,
      fontSize: 'normal' as FontSize,
      model: 'claude-sonnet-4-5',
      internetAccess: true,
      disabledTools: [] as string[],
      filePanelOpen: false,
      filePanelFileId: null,
      filePanelWidth: 360,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setLayoutMode: (mode) =>
        set({
          layoutMode: mode,
          sidebarOpen: mode !== 'focus',
          sidebarWidth: DEFAULT_WIDTHS[mode],
        }),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setFontSize: (size) => set({ fontSize: size }),
      setModel: (model) => set({ model }),
      setInternetAccess: (enabled) => set({ internetAccess: enabled }),
      setToolEnabled: (tool, enabled) =>
        set((state) => ({
          disabledTools: enabled
            ? state.disabledTools.filter((t) => t !== tool)
            : [...state.disabledTools, tool],
        })),
      openFilePanel: (fileId) => set({ filePanelOpen: true, filePanelFileId: fileId }),
      closeFilePanel: () => set({ filePanelOpen: false, filePanelFileId: null }),
      setFilePanelWidth: (width) => set({ filePanelWidth: width }),
    }),
    {
      name: 'vibe-ui-store',
      skipHydration: true,
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        layoutMode: state.layoutMode,
        sidebarWidth: state.sidebarWidth,
        fontSize: state.fontSize,
        model: state.model,
        internetAccess: state.internetAccess,
        disabledTools: state.disabledTools,
        filePanelWidth: state.filePanelWidth,
      }),
    },
  ),
);

/**
 * Rehydrate persisted store after mount and return mount status.
 * Call once in a top-level client component (AppShell).
 * Components with Radix UI (DropdownMenu, Dialog, etc.) should
 * only render after mounted=true to avoid React 19 hydration mismatches.
 */
export function useHydration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useUiStore.persist.rehydrate();
    setMounted(true);
  }, []);

  return mounted;
}
