import type { ClaudeStreamChunk } from './types';

/**
 * Parse a single line of stream-json output from Claude Code CLI.
 * Each line is a JSON object with a type field.
 *
 * Real CLI output format (with --verbose --print --output-format stream-json):
 *   {"type":"system","subtype":"init", ...}
 *   {"type":"assistant","message":{"content":[{"type":"text","text":"Hello!"}], ...}}
 *   {"type":"result","subtype":"success","result":"Hello!", ...}
 */
export function parseStreamLine(line: string): ClaudeStreamChunk | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const obj = parsed as Record<string, unknown>;
    const type = typeof obj['type'] === 'string' ? obj['type'] : undefined;

    if (!type) {
      // Legacy: handle objects with a "result" string field
      if (typeof obj['result'] === 'string') {
        return { type: 'text', content: obj['result'] };
      }
      return { type: 'text', content: JSON.stringify(obj), metadata: obj };
    }

    // System/init messages — skip
    if (type === 'system') {
      return null;
    }

    // Assistant message — extract text from message.content array
    if (type === 'assistant') {
      const message = obj['message'] as Record<string, unknown> | undefined;
      if (message && Array.isArray(message['content'])) {
        const textParts = (message['content'] as Record<string, unknown>[])
          .filter((c) => c['type'] === 'text' && typeof c['text'] === 'string')
          .map((c) => c['text'] as string);
        if (textParts.length > 0) {
          return { type: 'text', content: textParts.join(''), metadata: obj };
        }
      }
      // Fallback: content at top level
      if (typeof obj['content'] === 'string') {
        return { type: 'text', content: obj['content'], metadata: obj };
      }
      return null;
    }

    // Result — stream is done
    if (type === 'result') {
      const result = typeof obj['result'] === 'string' ? obj['result'] : '';
      return { type: 'done', content: result, metadata: obj };
    }

    // Error
    if (type === 'error') {
      const content = typeof obj['content'] === 'string'
        ? obj['content']
        : typeof obj['error'] === 'string'
          ? obj['error']
          : JSON.stringify(obj);
      return { type: 'error', content, metadata: obj };
    }

    // Tool use / tool result
    if (type === 'tool_use') {
      return {
        type: 'tool_use',
        content: typeof obj['content'] === 'string' ? obj['content'] : JSON.stringify(obj),
        metadata: obj,
      };
    }
    if (type === 'tool_result') {
      return {
        type: 'tool_result',
        content: typeof obj['content'] === 'string' ? obj['content'] : JSON.stringify(obj),
        metadata: obj,
      };
    }

    // Unknown type — skip
    return null;
  } catch {
    // Non-JSON line, treat as plain text
    return {
      type: 'text',
      content: trimmed,
    };
  }
}

/**
 * Parse a complete JSON response from Claude Code CLI (--output-format json).
 */
export function parseJsonResponse(raw: string): { text: string; metadata: Record<string, unknown> } {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid Claude Code response: expected object');
  }

  const obj = parsed as Record<string, unknown>;
  const text = typeof obj['result'] === 'string' ? obj['result'] : JSON.stringify(obj);

  return { text, metadata: obj };
}
