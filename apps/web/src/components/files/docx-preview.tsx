'use client';

import DOMPurify from 'dompurify';

interface DocxPreviewProps {
  html: string;
}

export function DocxPreview({ html }: DocxPreviewProps) {
  const sanitizedHtml = DOMPurify.sanitize(html);

  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-background p-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
