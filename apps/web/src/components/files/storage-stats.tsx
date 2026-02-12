'use client';

import { useTRPC } from '@/lib/trpc/react';
import { useQuery } from '@tanstack/react-query';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

const TYPE_COLORS: Record<string, string> = {
  image: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  pdf: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  docx: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  xlsx: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  csv: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  code: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  text: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
};

export function StorageStats() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.files.stats.queryOptions());

  if (!data) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {data.totalFiles} file{data.totalFiles !== 1 ? 's' : ''} · {formatSize(data.totalSize)}
      </span>
      {Object.entries(data.byType).map(([type, stats]) => (
        <span
          key={type}
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[type] ?? TYPE_COLORS.other}`}
        >
          {type}: {stats.count}
        </span>
      ))}
    </div>
  );
}
