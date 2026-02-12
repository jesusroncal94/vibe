import dynamic from 'next/dynamic';

export const PdfPreviewLazy = dynamic(() => import('./pdf-preview').then((m) => m.PdfPreview), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
      Loading PDF viewer...
    </div>
  ),
});
