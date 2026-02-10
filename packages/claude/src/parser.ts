import type { ClaudeStreamChunk } from './types.js';

/**
 * Parse a single line of stream-json output from Claude Code CLI.
 * Each line is a JSON object with a type field.
 */
export function parseStreamLine(line: string): ClaudeStreamChunk | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const obj = parsed as Record<string, unknown>;

    // Claude Code stream-json emits objects with a "type" field
    if (typeof obj['type'] === 'string') {
      return {
        type: mapChunkType(obj['type']),
        content: typeof obj['content'] === 'string' ? obj['content'] : JSON.stringify(obj),
        metadata: obj,
      };
    }

    // Handle assistant text chunks
    if (typeof obj['result'] === 'string') {
      return {
        type: 'text',
        content: obj['result'],
      };
    }

    return {
      type: 'text',
      content: JSON.stringify(obj),
      metadata: obj,
    };
  } catch {
    // Non-JSON line, treat as plain text
    return {
      type: 'text',
      content: trimmed,
    };
  }
}

function mapChunkType(type: string): ClaudeStreamChunk['type'] {
  switch (type) {
    case 'assistant':
    case 'text':
    case 'content':
      return 'text';
    case 'tool_use':
      return 'tool_use';
    case 'tool_result':
      return 'tool_result';
    case 'error':
      return 'error';
    case 'result':
      return 'done';
    default:
      return 'text';
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
