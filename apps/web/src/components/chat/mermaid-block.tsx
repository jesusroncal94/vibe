'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Check, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeBlock } from './code-block';

export interface MermaidBlockProps {
  code: string;
}

let mermaidInitialized = false;

function initMermaid(isDark: boolean) {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'strict',
  });
  mermaidInitialized = true;
}

export function MermaidBlock({ code }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        if (!mermaidInitialized) {
          initMermaid(isDark);
        }
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg: rendered } = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(rendered);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [code, isDark]);

  const handleCopySvg = useCallback(async () => {
    await navigator.clipboard.writeText(svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [svg]);

  const handleDownloadSvg = useCallback(() => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [svg]);

  if (error) {
    return <CodeBlock language="mermaid">{code}</CodeBlock>;
  }

  if (!svg) {
    return (
      <div className="my-3 flex h-32 items-center justify-center rounded-lg border bg-muted/50">
        <span className="text-sm text-muted-foreground">Rendering diagram...</span>
      </div>
    );
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center justify-between border-b bg-zinc-900 px-4 py-2">
        <span className="text-xs text-zinc-400">mermaid</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-200"
            onClick={handleCopySvg}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-200"
            onClick={handleDownloadSvg}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex justify-center overflow-auto p-4"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
