import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { z } from 'zod';
import {
  createConversation,
  createMessage,
  getMessages,
  getConversation,
  renameConversation,
  attachFilesToMessage,
  getFile,
  getSetting,
} from '@vibe/db';
import { createStreamSession } from '@vibe/claude';
import type { ClaudeModel } from '@vibe/claude';
import { formatFileSize } from '@/lib/file-utils';

function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
}

/** Sandboxed directory for Claude CLI so it doesn't see the project files. */
function getSandboxDir(): string {
  const dir = join(tmpdir(), 'vibe-sandbox');
  try {
    mkdirSync(dir, { recursive: true });
  } catch {
    // already exists
  }
  return dir;
}

const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful AI assistant. Answer questions clearly and concisely. ' +
  'You have access to web search to find current information when needed. ' +
  'If the user asks about code, ask them to share the specific code they want help with.';

/** Tools to allow in the Claude CLI session. */
const ALLOWED_TOOLS = [
  'Bash',
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'WebSearch',
  'WebFetch',
];

const streamRequestSchema = z.object({
  conversationId: z.string().nullable(),
  prompt: z.string().min(1),
  model: z.string().optional(),
  fileIds: z.array(z.string()).optional(),
  internetAccess: z.boolean().optional().default(true),
  disabledTools: z.array(z.string()).optional().default([]),
});

function buildFileContext(fileRecords: NonNullable<ReturnType<typeof getFile>>[]): string {
  if (fileRecords.length === 0) return '';

  const uploadsDir = getUploadsDir();
  const blocks: string[] = [];

  for (const file of fileRecords) {
    const size = formatFileSize(file.size);
    const meta = file.metadata as Record<string, unknown> | null;
    const extractedText = meta?.extractedText as string | undefined;
    const absolutePath = join(uploadsDir, file.path);

    if (extractedText) {
      blocks.push(
        `[Attached file: ${file.originalName} (${file.type}, ${size})]\n---\n${extractedText}\n---`,
      );
    } else if (file.type === 'image') {
      blocks.push(`[Attached image: ${file.originalName} (${size})]`);
    } else {
      blocks.push(
        `[Attached file: ${file.originalName} (${file.type}, ${size})]\nFile saved at: ${absolutePath}\nUse the Read tool to access this file.`,
      );
    }
  }

  return blocks.join('\n\n') + '\n\n';
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = streamRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { prompt, model, fileIds, internetAccess, disabledTools } = parsed.data;
  let { conversationId } = parsed.data;

  // Create conversation if new
  if (!conversationId) {
    const title = prompt.slice(0, 100) + (prompt.length > 100 ? '...' : '');
    const conv = createConversation({ title, model });
    conversationId = conv.id;
  } else {
    const existing = getConversation(conversationId);
    if (!existing) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }
  }

  // Save user message
  const userMessage = createMessage({
    conversationId,
    role: 'user',
    content: prompt,
  });

  // Attach pending files to the user message
  if (fileIds && fileIds.length > 0) {
    attachFilesToMessage(fileIds, userMessage.id);
  }

  // Fetch file records for context injection
  const fileRecords: NonNullable<ReturnType<typeof getFile>>[] = [];
  if (fileIds && fileIds.length > 0) {
    for (const fid of fileIds) {
      const record = getFile(fid);
      if (record) fileRecords.push(record);
    }
  }
  const fileContext = buildFileContext(fileRecords);

  // Build context from conversation history
  const history = getMessages(conversationId);
  const contextMessages = history
    .slice(0, -1) // exclude the message we just saved
    .map((m) => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const fullPrompt = contextMessages
    ? `Previous conversation:\n${contextMessages}\n\nHuman: ${fileContext}${prompt}`
    : `${fileContext}${prompt}`;

  // Read user-configured settings
  const userSystemPrompt = getSetting('systemPrompt') as string | undefined;
  const systemPrompt = userSystemPrompt || DEFAULT_SYSTEM_PROMPT;
  const maxTurns = (getSetting('maxTurns') as number | undefined) || undefined;

  // Filter out disabled tools and web tools when internet access is off
  const webTools = internetAccess ? [] : ['WebSearch', 'WebFetch'];
  const excluded = new Set([...webTools, ...disabledTools]);
  const allowedTools = ALLOWED_TOOLS.filter((t) => !excluded.has(t));

  // Create stream session in a sandboxed directory
  const session = createStreamSession(fullPrompt, {
    model: (model as ClaudeModel) ?? undefined,
    systemPrompt,
    cwd: getSandboxDir(),
    allowedTools,
    maxTurns,
  });

  let fullResponse = '';
  const finalConversationId = conversationId;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send conversation ID as first event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'init', conversationId: finalConversationId })}\n\n`),
      );

      try {
        for await (const chunk of session.stream) {
          if (chunk.type === 'text') {
            fullResponse += chunk.content;
            // Claude CLI stream-json emits the full response in one event.
            // Split into small chunks to simulate progressive streaming.
            const text = chunk.content;
            const chunkSize = 12;
            for (let i = 0; i < text.length; i += chunkSize) {
              const piece = text.slice(i, i + chunkSize);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'text', content: piece })}\n\n`,
                ),
              );
            }
          } else if (chunk.type === 'error') {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'error', content: chunk.content })}\n\n`,
              ),
            );
          }
        }

        // Save complete assistant message
        if (fullResponse) {
          createMessage({
            conversationId: finalConversationId,
            role: 'assistant',
            content: fullResponse,
            model: model ?? 'claude-sonnet-4-5',
          });

          // Auto-rename conversation if first exchange (title was the user's prompt)
          const conv = getConversation(finalConversationId);
          const msgs = getMessages(finalConversationId);
          if (conv && msgs.length <= 2 && conv.title === prompt.slice(0, 100) + (prompt.length > 100 ? '...' : '')) {
            // Strip markdown syntax from title
            const cleaned = fullResponse
              .replace(/^#{1,6}\s+/gm, '')  // headers
              .replace(/\*\*(.+?)\*\*/g, '$1') // bold
              .replace(/\*(.+?)\*/g, '$1')   // italic
              .replace(/`(.+?)`/g, '$1')     // inline code
              .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
              .replace(/\n/g, ' ')
              .trim();
            const summaryTitle =
              cleaned.length > 60
                ? cleaned.slice(0, 60) + '...'
                : cleaned;
            renameConversation(finalConversationId, summaryTitle);
          }
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'done', conversationId: finalConversationId })}\n\n`,
          ),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', content: message })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      session.abort();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
