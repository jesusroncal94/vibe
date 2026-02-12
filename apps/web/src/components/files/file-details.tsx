'use client';

import Link from 'next/link';
import { Download, FileText, Image, FileSpreadsheet, FileCode, File, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FileDetailsProps {
  id: string;
  originalName: string;
  type: string;
  mimeType: string;
  size: number;
  direction: string;
  conversationId: string | null;
  createdAt: Date;
  metadata?: Record<string, unknown> | null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString();
}

function fileIcon(type: string) {
  const cls = 'h-5 w-5';
  switch (type) {
    case 'image':
      return <Image className={cn(cls, 'text-blue-400')} />;
    case 'csv':
    case 'xlsx':
      return <FileSpreadsheet className={cn(cls, 'text-green-400')} />;
    case 'code':
      return <FileCode className={cn(cls, 'text-yellow-400')} />;
    case 'text':
    case 'pdf':
    case 'docx':
      return <FileText className={cn(cls, 'text-orange-400')} />;
    default:
      return <File className={cn(cls, 'text-muted-foreground')} />;
  }
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

export function FileDetails({
  id,
  originalName,
  type,
  mimeType,
  size,
  direction,
  conversationId,
  createdAt,
  metadata,
}: FileDetailsProps) {
  const meta = metadata as Record<string, unknown> | null;
  const pageCount = meta?.pageCount as number | undefined;
  const sheets = meta?.sheets as Array<{ name: string }> | undefined;
  const width = meta?.width as number | undefined;
  const height = meta?.height as number | undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {fileIcon(type)}
        <h3 className="flex-1 truncate font-medium" title={originalName}>
          {originalName}
        </h3>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <DetailRow label="Type">{type.toUpperCase()}</DetailRow>
        <DetailRow label="MIME">{mimeType}</DetailRow>
        <DetailRow label="Size">{formatSize(size)}</DetailRow>
        <DetailRow label="Direction">
          <span className="capitalize">{direction}</span>
        </DetailRow>
        <DetailRow label="Created">{formatDate(createdAt)}</DetailRow>
        {pageCount && <DetailRow label="Pages">{pageCount}</DetailRow>}
        {sheets && (
          <DetailRow label="Sheets">
            {sheets.map((s) => s.name).join(', ')}
          </DetailRow>
        )}
        {width && height && (
          <DetailRow label="Dimensions">
            {width} x {height}
          </DetailRow>
        )}
      </div>

      {conversationId && (
        <>
          <Separator />
          <Link
            href={`/chat/${conversationId}`}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            View conversation
          </Link>
        </>
      )}

      <Separator />

      <Button variant="outline" size="sm" className="gap-2" asChild>
        <a href={`/api/files/${id}`} download={originalName}>
          <Download className="h-4 w-4" />
          Download
        </a>
      </Button>
    </div>
  );
}
