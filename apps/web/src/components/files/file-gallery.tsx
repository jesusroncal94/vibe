'use client';

import { useCallback, useState } from 'react';
import { useTRPC } from '@/lib/trpc/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileToolbar } from './file-toolbar';
import { FileCard } from './file-card';
import { FileListView } from './file-list-view';
import { StorageStats } from './storage-stats';
import { FilePreviewDialog } from './file-preview-dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 20;

export function FileGallery() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);

  const queryInput = {
    search: search || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    direction: directionFilter !== 'all' ? directionFilter : undefined,
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  const { data, isLoading } = useQuery(trpc.files.list.queryOptions(queryInput));

  const previewFileQuery = useQuery(
    trpc.files.get.queryOptions(
      { id: previewFileId! },
      { enabled: !!previewFileId },
    ),
  );

  const files = data?.files ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleBatchDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const res = await fetch('/api/files/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', fileIds: Array.from(selectedIds) }),
    });
    if (res.ok) {
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: trpc.files.list.queryKey() });
      await queryClient.invalidateQueries({ queryKey: trpc.files.stats.queryKey() });
    }
  }, [selectedIds, queryClient, trpc]);

  const handleBatchDownload = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const res = await fetch('/api/files/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'download', fileIds: Array.from(selectedIds) }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'files.zip';
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [selectedIds]);

  const handleDelete = useCallback(
    async (id: string) => {
      const res = await fetch('/api/files/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', fileIds: [id] }),
      });
      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: trpc.files.list.queryKey() });
        await queryClient.invalidateQueries({ queryKey: trpc.files.stats.queryKey() });
      }
    },
    [queryClient, trpc],
  );

  const handleFileClick = useCallback((id: string) => {
    setPreviewFileId(id);
  }, []);

  const previewFile = previewFileQuery.data
    ? {
        id: previewFileQuery.data.id,
        originalName: previewFileQuery.data.originalName,
        size: previewFileQuery.data.size,
        type: previewFileQuery.data.type,
        mimeType: previewFileQuery.data.mimeType,
        metadata: previewFileQuery.data.metadata as Record<string, unknown> | null,
      }
    : null;

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Files</h1>
        <StorageStats />
      </div>

      <FileToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        typeFilter={typeFilter}
        onTypeFilterChange={(v) => { setTypeFilter(v); setPage(0); }}
        directionFilter={directionFilter}
        onDirectionFilterChange={(v) => { setDirectionFilter(v); setPage(0); }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedIds.size}
        onBatchDelete={() => void handleBatchDelete()}
        onBatchDownload={() => void handleBatchDownload()}
      />

      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Loading files...
        </div>
      ) : files.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No files found
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {files.map((file) => (
            <FileCard
              key={file.id}
              id={file.id}
              originalName={file.originalName}
              type={file.type}
              mimeType={file.mimeType}
              size={file.size}
              createdAt={file.createdAt}
              selected={selectedIds.has(file.id)}
              onSelect={toggleSelect}
              onClick={handleFileClick}
            />
          ))}
        </div>
      ) : (
        <FileListView
          files={files}
          selectedIds={selectedIds}
          onSelect={toggleSelect}
          onClick={handleFileClick}
          onDelete={(id) => void handleDelete(id)}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <FilePreviewDialog
        file={previewFile}
        open={previewFileId !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewFileId(null);
        }}
      />
    </div>
  );
}
