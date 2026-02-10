'use client';

import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="flex h-14 items-center border-b px-4 gap-4">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-md hover:bg-secondary"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="text-lg font-semibold">Vibe</h1>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sonnet 4.5</span>
      </div>
    </header>
  );
}
