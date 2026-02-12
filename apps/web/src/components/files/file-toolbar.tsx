'use client';

import { Search, Grid3X3, List, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FileToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  directionFilter: string;
  onDirectionFilterChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  selectedCount: number;
  onBatchDelete: () => void;
  onBatchDownload: () => void;
}

export function FileToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  directionFilter,
  onDirectionFilterChange,
  viewMode,
  onViewModeChange,
  selectedCount,
  onBatchDelete,
  onBatchDownload,
}: FileToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="image">Images</SelectItem>
          <SelectItem value="pdf">PDFs</SelectItem>
          <SelectItem value="docx">DOCX</SelectItem>
          <SelectItem value="xlsx">XLSX</SelectItem>
          <SelectItem value="csv">CSV</SelectItem>
          <SelectItem value="code">Code</SelectItem>
          <SelectItem value="text">Text</SelectItem>
          <SelectItem value="zip">ZIP</SelectItem>
        </SelectContent>
      </Select>

      <Select value={directionFilter} onValueChange={onDirectionFilterChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="All files" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All files</SelectItem>
          <SelectItem value="upload">Uploaded</SelectItem>
          <SelectItem value="generated">Generated</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1 rounded-lg border p-1">
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => onViewModeChange('grid')}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
          <Button variant="destructive" size="sm" onClick={onBatchDelete}>
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
          <Button variant="outline" size="sm" onClick={onBatchDownload}>
            <Download className="mr-1 h-3 w-3" />
            Download ZIP
          </Button>
        </div>
      )}
    </div>
  );
}
