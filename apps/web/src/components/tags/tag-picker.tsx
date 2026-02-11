'use client';

import { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TagBadge } from './tag-badge';
import { useTRPC } from '@/lib/trpc/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TagPickerProps {
  conversationId: string;
}

const TAG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
];

export function TagPicker({ conversationId }: TagPickerProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]!);

  const allTagsQuery = useQuery(trpc.tags.list.queryOptions());
  const conversationTagsQuery = useQuery(
    trpc.tags.forConversation.queryOptions({ conversationId }),
  );

  const allTags = allTagsQuery.data ?? [];
  const conversationTags = conversationTagsQuery.data ?? [];
  const assignedIds = new Set(conversationTags.map((t) => t.id));

  const assignMutation = useMutation(
    trpc.tags.assign.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.tags.forConversation.queryKey({ conversationId }),
        });
        void queryClient.invalidateQueries({ queryKey: trpc.chat.list.queryKey() });
      },
    }),
  );

  const removeMutation = useMutation(
    trpc.tags.remove.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.tags.forConversation.queryKey({ conversationId }),
        });
        void queryClient.invalidateQueries({ queryKey: trpc.chat.list.queryKey() });
      },
    }),
  );

  const createMutation = useMutation(
    trpc.tags.create.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries({ queryKey: trpc.tags.list.queryKey() });
        if (data && 'id' in data) {
          assignMutation.mutate({ conversationId, tagId: data.id as string });
        }
        setIsCreating(false);
        setNewTagName('');
      },
    }),
  );

  const unassignedTags = allTags.filter((t) => !assignedIds.has(t.id));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {conversationTags.map((tag) => (
          <TagBadge
            key={tag.id}
            name={tag.name}
            color={tag.color ?? '#6366f1'}
            onRemove={() => removeMutation.mutate({ conversationId, tagId: tag.id })}
          />
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
            <Tag className="h-3 w-3" />
            Add tag
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {unassignedTags.map((tag) => (
            <DropdownMenuItem
              key={tag.id}
              onClick={() => assignMutation.mutate({ conversationId, tagId: tag.id })}
            >
              <span
                className="mr-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: tag.color ?? '#6366f1' }}
              />
              {tag.name}
            </DropdownMenuItem>
          ))}

          {unassignedTags.length > 0 && <DropdownMenuSeparator />}

          {isCreating ? (
            <div className="p-2 space-y-2" onClick={(e) => e.stopPropagation()}>
              <input
                autoFocus
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTagName.trim()) {
                    createMutation.mutate({ name: newTagName.trim(), color: newTagColor });
                  }
                  if (e.key === 'Escape') setIsCreating(false);
                }}
                className="w-full rounded border bg-transparent px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex gap-1">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    className="h-4 w-4 rounded-full ring-offset-1"
                    style={{
                      backgroundColor: c,
                      outline: c === newTagColor ? '2px solid currentColor' : 'none',
                    }}
                    onClick={() => setNewTagColor(c)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <DropdownMenuItem onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-3 w-3" />
              Create new tag
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
