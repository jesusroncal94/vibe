import { describe, it, expect } from 'vitest';
import { parseStreamLine, parseJsonResponse } from './parser.js';

describe('parseStreamLine', () => {
  it('should return null for empty lines', () => {
    expect(parseStreamLine('')).toBeNull();
    expect(parseStreamLine('  ')).toBeNull();
  });

  it('should return null for system/init messages', () => {
    const line = JSON.stringify({ type: 'system', subtype: 'init', session_id: 'abc' });
    expect(parseStreamLine(line)).toBeNull();
  });

  it('should parse an assistant message with message.content array', () => {
    const line = JSON.stringify({
      type: 'assistant',
      message: {
        content: [{ type: 'text', text: 'Hello world' }],
        role: 'assistant',
      },
    });
    const result = parseStreamLine(line);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('text');
    expect(result!.content).toBe('Hello world');
  });

  it('should parse an assistant message with top-level content fallback', () => {
    const line = JSON.stringify({ type: 'assistant', content: 'Hello world' });
    const result = parseStreamLine(line);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('text');
    expect(result!.content).toBe('Hello world');
  });

  it('should join multiple text parts in assistant message', () => {
    const line = JSON.stringify({
      type: 'assistant',
      message: {
        content: [
          { type: 'text', text: 'Hello ' },
          { type: 'text', text: 'world' },
        ],
      },
    });
    const result = parseStreamLine(line);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('text');
    expect(result!.content).toBe('Hello world');
  });

  it('should parse a tool_use chunk', () => {
    const line = JSON.stringify({ type: 'tool_use', content: 'Reading file...' });
    const result = parseStreamLine(line);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('tool_use');
  });

  it('should parse a result chunk as done', () => {
    const line = JSON.stringify({ type: 'result', subtype: 'success', result: 'Final answer' });
    const result = parseStreamLine(line);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('done');
    expect(result!.content).toBe('Final answer');
  });

  it('should parse an error chunk', () => {
    const line = JSON.stringify({ type: 'error', content: 'Something went wrong' });
    const result = parseStreamLine(line);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('error');
    expect(result!.content).toBe('Something went wrong');
  });

  it('should handle a result string field (no type)', () => {
    const line = JSON.stringify({ result: 'Plain text response' });
    const result = parseStreamLine(line);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('text');
    expect(result!.content).toBe('Plain text response');
  });

  it('should handle non-JSON lines as text', () => {
    const result = parseStreamLine('Some plain text output');
    expect(result).not.toBeNull();
    expect(result!.type).toBe('text');
    expect(result!.content).toBe('Some plain text output');
  });

  it('should return null for assistant message with no text content', () => {
    const line = JSON.stringify({
      type: 'assistant',
      message: { content: [{ type: 'tool_use', id: 'abc' }] },
    });
    const result = parseStreamLine(line);
    expect(result).toBeNull();
  });

  it('should return null for unknown types', () => {
    const line = JSON.stringify({ type: 'unknown_event', data: 'foo' });
    expect(parseStreamLine(line)).toBeNull();
  });
});

describe('parseJsonResponse', () => {
  it('should parse a result field', () => {
    const raw = JSON.stringify({ result: 'Hello from Claude' });
    const { text } = parseJsonResponse(raw);
    expect(text).toBe('Hello from Claude');
  });

  it('should stringify non-string results', () => {
    const raw = JSON.stringify({ data: [1, 2, 3] });
    const { text } = parseJsonResponse(raw);
    expect(text).toContain('1');
  });

  it('should throw on invalid JSON', () => {
    expect(() => parseJsonResponse('not json')).toThrow();
  });

  it('should throw on non-object JSON', () => {
    expect(() => parseJsonResponse('"string"')).toThrow('expected object');
  });
});
