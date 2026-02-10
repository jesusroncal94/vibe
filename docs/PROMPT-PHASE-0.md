# Initial Prompt for Claude Code Web — PHASE 0

> **COPY AND PASTE this full prompt in your first Claude Code web session
> after connecting the `vibe` repo.**

---

## PROMPT:

Read the CLAUDE.md at the project root to understand the full context. Then read `docs/migration-plan.md` — specifically the sections "Monorepo Structure", "PHASE 0", "npm Dependencies per Package", "Database Schema", and "Claude Code CLI Integration".

Your task is to execute the **full Phase 0**: scaffold of the TypeScript monorepo with all functional packages. Here's exactly what to create:

### 1. Monorepo root configuration

- `pnpm-workspace.yaml` with packages: `packages/*` and `apps/*`
- `turbo.json` with pipelines: build, dev, lint, test, typecheck
- `tsconfig.base.json` with strict mode, path aliases (@vibe/shared, @vibe/db, @vibe/claude)
- Root `package.json` with devDependencies: typescript, eslint, prettier, vitest, turbo
- `.prettierrc` (semi: true, singleQuote: true, trailingComma: 'all', printWidth: 100)
- `eslint.config.mjs` (flat config, TypeScript plugin)

### 2. packages/shared

- Zod schemas: conversation, message, file, tag, settings (see DB schema in migration-plan.md)
- Types inferred from schemas
- Utilities: nanoid wrapper for generating IDs
- barrel export in index.ts
- package.json with name `@vibe/shared`
- tsconfig.json extending base

### 3. packages/db

- Drizzle ORM setup with better-sqlite3
- Full schema as in `docs/migration-plan.md` section 6:
  - conversations, messages, files, tags, conversation_tags, settings
  - enterprises and projects (prepared but not active)
- drizzle.config.ts
- First generated migration
- Basic exported queries: createConversation, getMessages, createMessage, etc.
- package.json with name `@vibe/db`

### 4. packages/claude

- TypeScript client that wraps Claude Code CLI via child_process.spawn
- `streamChat(prompt, options)` function that returns AsyncIterable of chunks
- `chat(prompt, options)` function for complete response (non-streaming)
- Parsing of JSON and stream-json output from Claude Code CLI
- Types for options (model, allowedTools, systemPrompt, maxTurns)
- Types for response chunks (text, tool_use, tool_result, error, done)
- package.json with name `@vibe/claude`
- Basic test with Vitest (mock spawn)

### 5. apps/web

- Next.js 15 with App Router, TypeScript, Tailwind CSS 4
- shadcn/ui installed and configured (dark/light theme)
- tRPC setup (server + client, with React Query)
- Functional base layout:
  - `app/layout.tsx` → providers (tRPC, theme)
  - `app/page.tsx` → redirect to /chat
  - `app/chat/page.tsx` → placeholder "Chat coming in Phase 1"
  - `app/settings/page.tsx` → placeholder "Settings coming in Phase 1"
- Initial components:
  - `components/layout/app-shell.tsx` → sidebar + main area
  - `components/layout/sidebar.tsx` → placeholder with logo and "New Chat" button
  - `components/layout/header.tsx` → brand + placeholder model selector
- A test tRPC router: `health.check` → returns { status: 'ok', timestamp }
- Verify that `pnpm dev` starts on localhost:3000

### 6. GitHub Actions

- `.github/workflows/ci.yml`:
  - Trigger: push to main, pull_request
  - Steps: checkout, setup node 22, pnpm install, typecheck, lint, build, test

### 7. Final verifications

After creating everything, run:
1. `pnpm install` → should install without errors
2. `pnpm build` → all packages compile
3. `pnpm typecheck` → no TypeScript errors
4. `pnpm test` → Vitest runs (at least the claude wrapper test)
5. `cd apps/web && pnpm dev` → Next.js starts on localhost:3000

If anything fails, fix it before finishing.

### Important notes

- **DO NOT create Phase 1 or 2 files** (chat UI, file uploads, etc.) — only the scaffold.
- **DO NOT create the CLI** (`apps/cli/`) — comes in Phase 4.
- **DO NOT use the Anthropic API directly** — the wrapper uses Claude Code CLI via subprocess.
- **Use exact versions:** Node 22, Next.js 15, Tailwind CSS 4, Drizzle ORM latest, tRPC v11.
- Path aliases (@vibe/*) must work in both build and dev.
- The DB schema is defined in detail in `docs/migration-plan.md` section 6 — follow that exact schema.

Commit everything with the message: `feat: scaffold vibe platform monorepo (Phase 0)`
