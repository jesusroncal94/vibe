'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeBlock } from './code-block';
import { FileAttachment } from './file-attachment';
import type { FileAttachmentData } from './file-attachment';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
  files?: FileAttachmentData[];
}

function tableToCsv(node: React.ReactNode): string {
  const rows: string[][] = [];

  function extractRows(children: React.ReactNode) {
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      const props = child.props as { children?: React.ReactNode };
      if (child.type === 'tr') {
        const cells: string[] = [];
        React.Children.forEach(props.children, (cell) => {
          if (React.isValidElement(cell)) {
            const cellProps = cell.props as { children?: React.ReactNode };
            const text = extractText(cellProps.children);
            // CSV quoting
            if (text.includes(',') || text.includes('"') || text.includes('\n')) {
              cells.push(`"${text.replace(/"/g, '""')}"`);
            } else {
              cells.push(text);
            }
          }
        });
        rows.push(cells);
      } else if (props.children) {
        extractRows(props.children);
      }
    });
  }

  function extractText(node: React.ReactNode): string {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (!node) return '';
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (React.isValidElement(node)) {
      const props = node.props as { children?: React.ReactNode };
      return extractText(props.children);
    }
    return '';
  }

  extractRows(node);
  return rows.map((r) => r.join(',')).join('\n');
}

export function MessageBubble({ role, content, isStreaming = false, files }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex gap-3 px-4 py-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted',
        )}
      >
        {isUser ? (
          <>
            <p className="whitespace-pre-wrap">{content}</p>
            {files && files.length > 0 && <FileAttachment files={files} />}
          </>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children }) {
                  const match = /language-(\w+)(?::(.+))?/.exec(className ?? '');
                  const codeString = String(children).replace(/\n$/, '');

                  if (match) {
                    return (
                      <CodeBlock language={match[1]} filename={match[2]}>
                        {codeString}
                      </CodeBlock>
                    );
                  }

                  return (
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {children}
                    </code>
                  );
                },
                pre({ children }) {
                  return <>{children}</>;
                },
                th({ children }) {
                  return (
                    <th className="border border-border/50 px-3 py-1.5 text-left font-semibold">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td className="border border-border/50 px-3 py-1.5">
                      {children}
                    </td>
                  );
                },
                table({ children }) {
                  const handleDownloadCsv = () => {
                    const csv = tableToCsv(children);
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'table.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  };

                  return (
                    <div className="my-3">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          {children}
                        </table>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadCsv}
                        className="mt-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Download CSV
                      </button>
                    </div>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-foreground" />
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
