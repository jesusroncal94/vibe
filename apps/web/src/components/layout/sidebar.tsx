'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  MessageSquarePlus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TagFilter } from '@/components/tags/tag-filter';
import { TagBadge } from '@/components/tags/tag-badge';
import { TagPicker } from '@/components/tags/tag-picker';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/lib/trpc/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SidebarProps {
  isOpen: boolean;
  width: string;
}

interface ConversationTag {
  id: string;
  name: string;
  color: string | null;
}

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: Date;
  lastMessage: { content: string; createdAt: Date; role: string } | null;
  tags: ConversationTag[];
}

function groupByDate(items: ConversationItem[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const lastWeek = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, ConversationItem[]> = {
    Today: [],
    Yesterday: [],
    'Last 7 days': [],
    Older: [],
  };

  for (const item of items) {
    const date = new Date(item.updatedAt);
    if (date >= today) {
      groups['Today']!.push(item);
    } else if (date >= yesterday) {
      groups['Yesterday']!.push(item);
    } else if (date >= lastWeek) {
      groups['Last 7 days']!.push(item);
    } else {
      groups['Older']!.push(item);
    }
  }

  return groups;
}

export function Sidebar({ isOpen, width }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [taggingId, setTaggingId] = useState<string | null>(null);

  const conversationsQuery = useQuery(trpc.chat.list.queryOptions());
  const conversations = (conversationsQuery.data ?? []) as ConversationItem[];

  const deleteMutation = useMutation(
    trpc.chat.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.chat.list.queryKey() });
        router.push('/chat');
      },
    }),
  );

  const renameMutation = useMutation(
    trpc.chat.rename.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.chat.list.queryKey() });
        setEditingId(null);
      },
    }),
  );

  const filtered = useMemo(() => {
    let result = conversations;

    // Filter by tag
    if (selectedTagId) {
      result = result.filter((c) =>
        c.tags.some((t) => t.id === selectedTagId),
      );
    }

    // Filter by search
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(lower) ||
          c.lastMessage?.content.toLowerCase().includes(lower),
      );
    }

    return result;
  }, [conversations, search, selectedTagId]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const handleNewChat = useCallback(() => {
    router.push('/chat');
  }, [router]);

  const handleRenameSubmit = useCallback(
    (id: string) => {
      if (editTitle.trim()) {
        renameMutation.mutate({ id, title: editTitle.trim() });
      } else {
        setEditingId(null);
      }
    },
    [editTitle, renameMutation],
  );

  if (!isOpen) return null;

  return (
    <aside className={cn('flex flex-col border-r bg-card', width)}>
      <div className="flex items-center gap-2 p-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 justify-start gap-2"
          onClick={handleNewChat}
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <TagFilter selectedTagId={selectedTagId} onSelect={setSelectedTagId} />

      <ScrollArea className="flex-1">
        <div className="px-2 pb-4">
          {Object.entries(grouped).map(
            ([group, items]) =>
              items.length > 0 && (
                <div key={group} className="mb-3">
                  <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">{group}</p>
                  {items.map((conv) => {
                    const isActive = pathname === `/chat/${conv.id}`;

                    return (
                      <div key={conv.id}>
                        <div
                          className={cn(
                            'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer',
                            isActive
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent/50',
                          )}
                          onClick={() => router.push(`/chat/${conv.id}`)}
                        >
                          {editingId === conv.id ? (
                            <input
                              autoFocus
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={() => handleRenameSubmit(conv.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSubmit(conv.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 bg-transparent text-sm outline-none border-b border-primary"
                            />
                          ) : (
                            <span className="flex-1 truncate">{conv.title}</span>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(conv.id);
                                  setEditTitle(conv.title);
                                }}
                              >
                                <Pencil className="mr-2 h-3 w-3" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTaggingId(taggingId === conv.id ? null : conv.id);
                                }}
                              >
                                <Tag className="mr-2 h-3 w-3" />
                                Tags
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate({ id: conv.id });
                                }}
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Tag badges */}
                        {conv.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 px-2 pb-1">
                            {conv.tags.map((tag) => (
                              <TagBadge
                                key={tag.id}
                                name={tag.name}
                                color={tag.color ?? '#6366f1'}
                                className="h-4 text-[10px]"
                              />
                            ))}
                          </div>
                        )}

                        {/* Inline tag picker */}
                        {taggingId === conv.id && (
                          <div
                            className="px-2 pb-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <TagPicker conversationId={conv.id} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ),
          )}

          {conversations.length === 0 && (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              No conversations yet
            </p>
          )}

          {conversations.length > 0 && filtered.length === 0 && (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              No matching conversations
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
