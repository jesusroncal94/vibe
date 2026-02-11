'use client';

import { useRouter } from 'next/navigation';
import { Menu, Settings, Layout, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModelSelector } from '@/components/chat/model-selector';
import { useUiStore } from '@/lib/stores/ui-store';

const layoutModes = [
  { id: 'focus' as const, label: 'Focus', description: 'No sidebar' },
  { id: 'minimal' as const, label: 'Minimal', description: 'Compact sidebar' },
  { id: 'productivity' as const, label: 'Productivity', description: 'Wide sidebar' },
];

interface HeaderProps {
  onSearchOpen?: () => void;
}

export function Header({ onSearchOpen }: HeaderProps) {
  const router = useRouter();
  const { toggleSidebar, layoutMode, setLayoutMode, model, setModel } = useUiStore();

  return (
    <header className="flex h-14 items-center border-b px-4 gap-4">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-lg font-semibold">Vibe</h1>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-xs text-muted-foreground"
          onClick={onSearchOpen}
          aria-label="Search"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            Ctrl+K
          </kbd>
        </Button>

        <ModelSelector model={model} onModelChange={setModel} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Layout mode">
              <Layout className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {layoutModes.map((mode) => (
              <DropdownMenuItem
                key={mode.id}
                onClick={() => setLayoutMode(mode.id)}
                className="flex flex-col items-start"
              >
                <span className={layoutMode === mode.id ? 'font-semibold' : ''}>
                  {mode.label}
                </span>
                <span className="text-xs text-muted-foreground">{mode.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/settings')}
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
