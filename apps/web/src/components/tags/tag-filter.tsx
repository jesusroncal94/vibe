'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/lib/trpc/react';
import { useQuery } from '@tanstack/react-query';

interface TagFilterProps {
  selectedTagId: string | null;
  onSelect: (tagId: string | null) => void;
}

export function TagFilter({ selectedTagId, onSelect }: TagFilterProps) {
  const trpc = useTRPC();
  const tagsQuery = useQuery(trpc.tags.list.queryOptions());
  const tags = tagsQuery.data ?? [];

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 px-3 pb-2">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-6 rounded-full px-2 text-xs',
          selectedTagId === null && 'bg-accent',
        )}
        onClick={() => onSelect(null)}
      >
        All
      </Button>
      {tags.map((tag) => (
        <Button
          key={tag.id}
          variant="ghost"
          size="sm"
          className={cn(
            'h-6 gap-1 rounded-full px-2 text-xs',
            selectedTagId === tag.id && 'bg-accent',
          )}
          onClick={() => onSelect(selectedTagId === tag.id ? null : tag.id)}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: tag.color ?? '#6366f1' }}
          />
          {tag.name}
        </Button>
      ))}
    </div>
  );
}
