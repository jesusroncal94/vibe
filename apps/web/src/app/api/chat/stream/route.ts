import { z } from 'zod';
import {
  createConversation,
  createMessage,
  getMessages,
  getConversation,
  renameConversation,
} from '@vibe/db';
import { createStreamSession } from '@vibe/claude';
import type { ClaudeModel } from '@vibe/claude';

const streamRequestSchema = z.object({
  conversationId: z.string().nullable(),
  prompt: z.string().min(1),
  model: z.string().optional(),
});

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

  const { prompt, model } = parsed.data;
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
  createMessage({
    conversationId,
    role: 'user',
    content: prompt,
  });

  // Build context from conversation history
  const history = getMessages(conversationId);
  const contextMessages = history
    .slice(0, -1) // exclude the message we just saved
    .map((m) => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const fullPrompt = contextMessages
    ? `Previous conversation:\n${contextMessages}\n\nHuman: ${prompt}`
    : prompt;

  // Create stream session
  const session = createStreamSession(fullPrompt, {
    model: (model as ClaudeModel) ?? undefined,
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
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'text', content: chunk.content })}\n\n`,
              ),
            );
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
            const summaryTitle =
              fullResponse.length > 60
                ? fullResponse.slice(0, 60).replace(/\n/g, ' ') + '...'
                : fullResponse.replace(/\n/g, ' ');
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
