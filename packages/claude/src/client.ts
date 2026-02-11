import { spawn, execSync } from 'node:child_process';
import type { ClaudeOptions, ClaudeStreamChunk, ClaudeResponse, StreamSession } from './types';
import { parseStreamLine, parseJsonResponse } from './parser';

let _claudePath: string | null = null;

function getClaudePath(): string {
  if (_claudePath) return _claudePath;
  try {
    _claudePath = execSync('which claude', { encoding: 'utf-8' }).trim();
  } catch {
    _claudePath = 'claude';
  }
  return _claudePath;
}

function spawnClaude(args: string[], cwd?: string) {
  const proc = spawn(getClaudePath(), args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env },
    cwd,
  });
  // Close stdin so CLI doesn't wait for interactive input
  proc.stdin.end();
  return proc;
}

function buildArgs(prompt: string, options: ClaudeOptions, streaming: boolean): string[] {
  const args: string[] = [
    '--print',
    '--output-format',
    streaming ? 'stream-json' : 'json',
    '--model',
    options.model ?? 'claude-sonnet-4-5',
  ];

  // --verbose is required when using --print with stream-json
  if (streaming) {
    args.push('--verbose');
  }

  if (options.allowedTools?.length) {
    args.push('--allowedTools', options.allowedTools.join(','));
  }

  if (options.systemPrompt) {
    args.push('--system-prompt', options.systemPrompt);
  }

  if (options.maxTurns !== undefined) {
    args.push('--max-turns', String(options.maxTurns));
  }

  args.push(prompt);

  return args;
}

/**
 * Stream a chat with Claude Code CLI. Returns an AsyncIterable of chunks.
 */
export async function* streamChat(
  prompt: string,
  options: ClaudeOptions = {},
): AsyncGenerator<ClaudeStreamChunk> {
  const args = buildArgs(prompt, options, true);

  const proc = spawnClaude(args, options.cwd);

  let buffer = '';

  const iterator = new Promise<void>((resolve, reject) => {
    proc.on('error', (err) => reject(new Error(`Failed to spawn claude: ${err.message}`)));
    proc.on('close', () => resolve());
  });

  const chunks: ClaudeStreamChunk[] = [];
  let done = false;

  proc.stdout.on('data', (data: Buffer) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const chunk = parseStreamLine(line);
      if (chunk) {
        chunks.push(chunk);
      }
    }
  });

  proc.stderr.on('data', (data: Buffer) => {
    const errText = data.toString().trim();
    if (errText) {
      chunks.push({ type: 'error', content: errText });
    }
  });

  proc.on('close', () => {
    // Process remaining buffer
    if (buffer.trim()) {
      const chunk = parseStreamLine(buffer);
      if (chunk) {
        chunks.push(chunk);
      }
    }
    done = true;
  });

  // Yield chunks as they arrive
  while (!done || chunks.length > 0) {
    if (chunks.length > 0) {
      yield chunks.shift()!;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  await iterator;
}

/**
 * Create a stream session with abort support.
 * Returns an AsyncGenerator and an abort() function to kill the process.
 */
export function createStreamSession(
  prompt: string,
  options: ClaudeOptions = {},
): StreamSession {
  const args = buildArgs(prompt, options, true);

  const proc = spawnClaude(args, options.cwd);

  let buffer = '';
  const chunks: ClaudeStreamChunk[] = [];
  let done = false;
  let aborted = false;

  proc.stdout.on('data', (data: Buffer) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const chunk = parseStreamLine(line);
      if (chunk) {
        chunks.push(chunk);
      }
    }
  });

  proc.stderr.on('data', (data: Buffer) => {
    const errText = data.toString().trim();
    if (errText && !aborted) {
      chunks.push({ type: 'error', content: errText });
    }
  });

  proc.on('close', () => {
    if (buffer.trim()) {
      const chunk = parseStreamLine(buffer);
      if (chunk) {
        chunks.push(chunk);
      }
    }
    done = true;
  });

  async function* generate(): AsyncGenerator<ClaudeStreamChunk> {
    while (!done || chunks.length > 0) {
      if (chunks.length > 0) {
        yield chunks.shift()!;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
  }

  function abort() {
    aborted = true;
    proc.kill('SIGTERM');
  }

  return { stream: generate(), abort };
}

/**
 * Send a chat message to Claude Code CLI and wait for the complete response.
 */
export async function chat(
  prompt: string,
  options: ClaudeOptions = {},
): Promise<ClaudeResponse> {
  const args = buildArgs(prompt, options, false);
  const startTime = Date.now();

  return new Promise<ClaudeResponse>((resolve, reject) => {
    const proc = spawnClaude(args, options.cwd);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to spawn claude: ${err.message}`));
    });

    proc.on('close', (code) => {
      const durationMs = Date.now() - startTime;

      if (code !== 0) {
        reject(new Error(`Claude Code exited with code ${String(code)}: ${stderr}`));
        return;
      }

      try {
        const { text } = parseJsonResponse(stdout);
        resolve({
          text,
          model: options.model ?? 'claude-sonnet-4-5',
          durationMs,
        });
      } catch {
        // If JSON parsing fails, return raw stdout
        resolve({
          text: stdout.trim(),
          model: options.model ?? 'claude-sonnet-4-5',
          durationMs,
        });
      }
    });
  });
}
