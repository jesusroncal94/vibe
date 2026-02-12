import dynamic from 'next/dynamic';

export const MermaidBlockLazy = dynamic(
  () => import('./mermaid-block').then((m) => m.MermaidBlock),
  {
    ssr: false,
    loading: () => (
      <div className="my-3 flex h-32 items-center justify-center rounded-lg border bg-muted/50">
        <span className="text-sm text-muted-foreground">Loading diagram renderer...</span>
      </div>
    ),
  },
);
