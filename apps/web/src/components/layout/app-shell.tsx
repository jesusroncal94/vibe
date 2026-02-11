'use client';

import { useCallback, useMemo, useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { SearchDialog } from '@/components/chat/search-dialog';
import { useUiStore, useHydration } from '@/lib/stores/ui-store';
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';

const sidebarWidths = {
  focus: 'w-0',
  minimal: 'w-64',
  productivity: 'w-80',
} as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const mounted = useHydration();
  const { sidebarOpen, layoutMode } = useUiStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const shortcuts = useMemo(
    () => ({ onSearchOpen: () => setSearchOpen(true) }),
    [],
  );
  useKeyboardShortcuts(shortcuts);

  const showSidebar = sidebarOpen && layoutMode !== 'focus';
  const sidebarWidth = sidebarWidths[layoutMode];

  const handleSearchOpen = useCallback(() => {
    setSearchOpen(true);
  }, []);

  // Render a minimal shell during SSR / before mount to avoid
  // React 19 hydration mismatches from Radix UI components.
  if (!mounted) {
    return (
      <div className="flex h-screen flex-col">
        <header className="flex h-14 items-center border-b px-4" />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onSearchOpen={handleSearchOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={showSidebar} width={sidebarWidth} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
