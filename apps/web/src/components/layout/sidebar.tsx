'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  MessageSquarePlus,
  Search,
  Pencil,
  Trash2,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TagFilter } from '@/components/tags/tag-filter';
import { TagBadge } from '@/components/tags/tag-badge';
import { TagPicker } from '@/components/tags/tag-picker';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/lib/stores/ui-store';
import { useTRPC } from '@/lib/trpc/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

interface SidebarProps {
  isOpen: boolean;
  widthPx: number;
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

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
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

export function Sidebar({ isOpen, widthPx }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const setSidebarWidth = useUiStore((s) => s.setSidebarWidth);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [taggingId, setTaggingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const isDragging = useRef(false);

  const conversationsQuery = useQuery(trpc.chat.list.queryOptions());
  const conversations = (conversationsQuery.data ?? []) as ConversationItem[];

  const deleteMutation = useMutation(
    trpc.chat.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.chat.list.queryKey() });
        setDeleteTarget(null);
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

    if (selectedTagId) {
      result = result.filter((c) =>
        c.tags.some((t) => t.id === selectedTagId),
      );
    }

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

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
    }
  }, [deleteTarget, deleteMutation]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const startX = e.clientX;
      const startWidth = widthPx;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current) return;
        const delta = moveEvent.clientX - startX;
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
        setSidebarWidth(newWidth);
      };

      const onMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [widthPx, setSidebarWidth],
  );

  if (!isOpen) return null;

  return (
    <aside
      className="relative flex flex-col border-r bg-card shrink-0"
      style={{ width: widthPx }}
    >
      {/* Header */}
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

      {/* Search */}
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

      {/* Tag filter */}
      <TagFilter selectedTagId={selectedTagId} onSelect={setSelectedTagId} />

      {/* Conversation list — native scroll, no Radix ScrollArea */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {Object.entries(grouped).map(
          ([group, items]) =>
            items.length > 0 && (
              <div key={group} className="mb-3">
                <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">{group}</p>
                {items.map((conv) => {
                  const isActive = pathname === `/chat/${conv.id}`;

                  return (
                    <div key={conv.id} className="mb-0.5">
                      <div
                        className={cn(
                          'flex items-center gap-1 rounded-md px-2 py-2 text-sm cursor-pointer',
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/50',
                        )}
                        onClick={() => router.push(`/chat/${conv.id}`)}
                      >
                        {/* Title & preview */}
                        <div className="min-w-0 flex-1">
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
                              className="w-full bg-transparent text-sm outline-none border-b border-primary"
                            />
                          ) : (
                            <>
                              <div className="flex items-center gap-1">
                                <span className="flex-1 truncate font-medium">{conv.title}</span>
                                <span className="shrink-0 text-[10px] text-muted-foreground">
                                  {formatRelativeTime(conv.updatedAt)}
                                </span>
                              </div>
                              {conv.lastMessage && (
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                  {conv.lastMessage.content.slice(0, 60)}
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        {/* Action buttons — always visible */}
                        {editingId !== conv.id && (
                          <TooltipProvider delayDuration={300}>
                            <div className="flex shrink-0 items-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingId(conv.id);
                                      setEditTitle(conv.title);
                                    }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">Rename</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTaggingId(taggingId === conv.id ? null : conv.id);
                                    }}
                                  >
                                    <Tag className="h-3 w-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">Tags</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteTarget({ id: conv.id, title: conv.title });
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">Delete</TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        )}
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

      {/* Drag handle to resize */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/40 z-10"
        onMouseDown={handleResizeStart}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
