export type ClaudeModel = 'claude-sonnet-4-5' | 'claude-opus-4-5' | 'claude-haiku-4-5';

export interface ClaudeOptions {
  model?: ClaudeModel;
  allowedTools?: string[];
  systemPrompt?: string;
  maxTurns?: number;
}

export type StreamChunkType = 'text' | 'tool_use' | 'tool_result' | 'error' | 'done';

export interface ClaudeStreamChunk {
  type: StreamChunkType;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ClaudeResponse {
  text: string;
  model: string;
  durationMs: number;
}

export interface StreamSession {
  stream: AsyncGenerator<ClaudeStreamChunk>;
  abort: () => void;
}
