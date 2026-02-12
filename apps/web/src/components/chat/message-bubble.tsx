'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeBlock } from './code-block';
import { MermaidBlockLazy } from './mermaid-block-lazy';
import { ExportMenu } from './export-menu';
import { FileAttachment } from './file-attachment';
import type { FileAttachmentData } from './file-attachment';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
  files?: FileAttachmentData[];
  messageId?: string;
  conversationId?: string;
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

function tableToData(node: React.ReactNode): { headers: string[]; rows: string[][] } {
  const allRows: string[][] = [];

  function extractRows(children: React.ReactNode) {
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      const props = child.props as { children?: React.ReactNode };
      if (child.type === 'tr') {
        const cells: string[] = [];
        React.Children.forEach(props.children, (cell) => {
          if (React.isValidElement(cell)) {
            const cellProps = cell.props as { children?: React.ReactNode };
            cells.push(extractText(cellProps.children));
          }
        });
        allRows.push(cells);
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
  const headers = allRows[0] ?? [];
  const rows = allRows.slice(1);
  return { headers, rows };
}

export function MessageBubble({
  role,
  content,
  isStreaming = false,
  files,
  messageId,
  conversationId,
}: MessageBubbleProps) {
  const isUser = role === 'user';
  const showExport = !isUser && content.length > 50 && !isStreaming;

  return (
    <div className={cn('group/msg flex gap-3 px-4 py-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div
        className={cn(
          'relative max-w-[80%] rounded-2xl px-4 py-3 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted',
        )}
      >
        {showExport && (
          <div className="absolute -right-1 -top-1">
            <ExportMenu
              content={content}
              messageId={messageId}
              conversationId={conversationId}
              hasTable={content.includes('|')}
            />
          </div>
        )}
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
                    const lang = match[1];
                    if (lang === 'mermaid') {
                      return <MermaidBlockLazy code={codeString} />;
                    }
                    return (
                      <CodeBlock language={lang} filename={match[2]}>
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

                  const handleDownloadXlsx = async () => {
                    const data = tableToData(children);
                    const res = await fetch('/api/files/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'xlsx',
                        tableData: [{ headers: data.headers, rows: data.rows, sheetName: 'Table' }],
                        filename: 'table.xlsx',
                        messageId,
                        conversationId,
                      }),
                    });
                    if (res.ok) {
                      const result = (await res.json()) as { id: string };
                      const a = document.createElement('a');
                      a.href = `/api/files/${result.id}`;
                      a.download = 'table.xlsx';
                      a.click();
                    }
                  };

                  return (
                    <div className="my-3">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          {children}
                        </table>
                      </div>
                      <div className="mt-1 flex gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadCsv}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Download CSV
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadXlsx}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Download XLSX
                        </button>
                      </div>
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
