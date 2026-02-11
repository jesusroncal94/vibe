'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, MessageSquarePlus, Settings, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/lib/trpc/react';
import { useQuery } from '@tanstack/react-query';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  type: 'conversation' | 'action';
  title: string;
  description?: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const trpc = useTRPC();
  const conversationsQuery = useQuery({
    ...trpc.chat.list.queryOptions(),
    enabled: open,
  });
  const conversations = conversationsQuery.data ?? [];

  const close = useCallback(() => {
    onOpenChange(false);
    setQuery('');
    setSelectedIndex(0);
  }, [onOpenChange]);

  const results = useMemo<SearchResult[]>(() => {
    const actions: SearchResult[] = [
      {
        id: 'action-new-chat',
        type: 'action',
        title: 'New Chat',
        description: 'Start a new conversation',
        icon: <MessageSquarePlus className="h-4 w-4" />,
        onSelect: () => {
          router.push('/chat');
          close();
        },
      },
      {
        id: 'action-settings',
        type: 'action',
        title: 'Settings',
        description: 'Open settings page',
        icon: <Settings className="h-4 w-4" />,
        onSelect: () => {
          router.push('/settings');
          close();
        },
      },
    ];

    const convResults: SearchResult[] = conversations.map((conv) => ({
      id: conv.id,
      type: 'conversation' as const,
      title: conv.title,
      description: (conv as { lastMessage?: { content: string } | null }).lastMessage?.content?.slice(0, 80),
      icon: <MessageSquare className="h-4 w-4" />,
      onSelect: () => {
        router.push(`/chat/${conv.id}`);
        close();
      },
    }));

    if (!query) {
      return [...actions, ...convResults.slice(0, 10)];
    }

    const lower = query.toLowerCase();
    const matchedActions = actions.filter(
      (a) => a.title.toLowerCase().includes(lower) || a.description?.toLowerCase().includes(lower),
    );
    const matchedConvs = convResults.filter(
      (c) => c.title.toLowerCase().includes(lower) || c.description?.toLowerCase().includes(lower),
    );

    return [...matchedActions, ...matchedConvs];
  }, [query, conversations, router, close]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        results[selectedIndex]?.onSelect();
      }
    },
    [results, selectedIndex],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search conversations or type a command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="h-11 border-0 px-0 text-sm focus-visible:ring-0"
          />
        </div>

        <ScrollArea className="max-h-72">
          {results.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No results found
            </p>
          ) : (
            <div className="p-1">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm',
                    index === selectedIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50',
                  )}
                  onClick={result.onSelect}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="shrink-0 text-muted-foreground">{result.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{result.title}</p>
                    {result.description && (
                      <p className="truncate text-xs text-muted-foreground">{result.description}</p>
                    )}
                  </div>
                  {result.type === 'action' && (
                    <span className="shrink-0 text-xs text-muted-foreground">Action</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div className="flex gap-2">
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
            <span>navigate</span>
          </div>
          <div className="flex gap-2">
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
            <span>select</span>
          </div>
          <div className="flex gap-2">
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">esc</kbd>
            <span>close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
