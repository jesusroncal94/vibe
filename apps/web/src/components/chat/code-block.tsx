'use client';

import { useCallback, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  language?: string;
  filename?: string;
  children: string;
}

export function CodeBlock({ language, filename, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  const handleDownload = useCallback(() => {
    const downloadName = filename ?? `code.${language ?? 'txt'}`;
    const blob = new Blob([children], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    a.click();
    URL.revokeObjectURL(url);
  }, [children, language, filename]);

  const displayLabel = filename ?? language ?? 'text';

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border bg-zinc-950">
      <div className="flex items-center justify-between border-b bg-zinc-900 px-4 py-2">
        <span className="text-xs text-zinc-400">{displayLabel}</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-200"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-200"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language ?? 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.85rem',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
