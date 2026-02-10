'use client';

import { Header } from './header';
import { Sidebar } from './sidebar';
import { useUiStore } from '@/lib/stores/ui-store';
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';

const sidebarWidths = {
  focus: 'w-0',
  minimal: 'w-64',
  productivity: 'w-80',
} as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, layoutMode } = useUiStore();

  useKeyboardShortcuts();

  const showSidebar = sidebarOpen && layoutMode !== 'focus';
  const sidebarWidth = sidebarWidths[layoutMode];

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={showSidebar} width={sidebarWidth} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
