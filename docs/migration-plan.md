# Vibe Platform — Definitive Migration Plan

> **Decisions finalized:**
> - Full migration to TypeScript (monorepo)
> - Claude Code CLI as backend (Max Plan $100/month, no extra API cost)
> - Single user for now, designed to scale
> - Priority: Professional Web UI + advanced document handling
> - The architecture document (5,700+ lines) is the main reference

---

## 1. Resolved Technical Decisions

### Backend: Claude Code CLI (not direct API)

```
Why?
├── Max Plan ($100/month) includes unlimited Claude Code CLI usage
├── Direct API would cost $X/month EXTRA in tokens
├── Claude Code CLI already supports native tools (Read, Write, Bash)
├── When you scale, migrate to Agent SDK (same engine, programmatic)
└── ai-hub already validated that this approach works

Node.js implementation:
├── child_process.spawn('claude', [...args], { stdio: 'pipe' })
├── Real streaming via stdout pipe
├── Flags: --model, --allowedTools, --output-format json
├── claude --output-format stream-json for structured streaming
└── TypeScript wrapper with types to parse the response
```

### Stack: TypeScript everywhere

```
Why migrate from Python?
├── The Claude Code ecosystem is Node/TS (hooks, MCP SDK, Agent SDK, plugins)
├── The architecture defines TypeScript as the single language
├── Next.js (frontend) + Node.js (backend) = one language
├── MCP servers are written in TS with @anthropic/mcp-sdk
├── Shared types between packages (Zod schemas)
├── When the time comes for plugins, you're already in the right ecosystem
└── Cost to migrate now: ~4-6 weeks
    Cost to migrate later: ~4-6 weeks + rewrite integrations
```

### Current vs future scope

```
NOW (Phases 0-2, ~5-6 weeks):
├── 1 user (you)
├── 1-3 projects
├── Web UI with chat + documents
├── Claude Code CLI as backend
├── Local SQLite
├── No complex auth (simple or none)
└── No multi-enterprise (structure prepared but not active)

FUTURE (Phases 3+, when you scale):
├── Multiple users
├── Real multi-enterprise
├── Agent SDK (replaces subprocess)
├── PostgreSQL (replaces SQLite)
├── Better Auth (replaces simple auth)
├── Plugins + marketplace
└── CI/CD + workers
```

---

## 2. Monorepo Structure

```
jesusroncal94/vibe/
│
├── packages/
│   ├── shared/                     ← Types, Zod schemas, utilities
│   │   ├── src/
│   │   │   ├── schemas/            ← Zod schemas (conversation, message, file, etc.)
│   │   │   ├── types/              ← TypeScript types/interfaces
│   │   │   └── utils/              ← Shared helpers
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── db/                         ← Drizzle ORM + SQLite
│   │   ├── src/
│   │   │   ├── schema/             ← Tables (users, conversations, messages, files, etc.)
│   │   │   ├── migrations/         ← SQL migrations
│   │   │   └── index.ts            ← DB client + queries
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   └── claude/                     ← Claude Code CLI wrapper ★ NEW
│       ├── src/
│       │   ├── client.ts           ← Spawn + CLI streaming
│       │   ├── parser.ts           ← Parse JSON/stream output
│       │   ├── types.ts            ← Claude Code response types
│       │   └── tools.ts            ← Allowed tools configuration
│       └── package.json
│
├── apps/
│   └── web/                        ← Next.js 15 (App Router) ★ PRIORITY
│       ├── src/
│       │   ├── app/                ← App Router pages
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx        ← Redirect to /chat
│       │   │   ├── chat/
│       │   │   │   ├── page.tsx    ← Main chat
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx ← Specific conversation
│       │   │   ├── files/
│       │   │   │   └── page.tsx    ← File gallery
│       │   │   └── settings/
│       │   │       └── page.tsx    ← Configuration
│       │   │
│       │   ├── components/
│       │   │   ├── chat/           ← ChatArea, MessageList, InputBar
│       │   │   ├── sidebar/        ← ConversationList, Search, Tags
│       │   │   ├── files/          ← FileUpload, FilePreview, FileGallery
│       │   │   ├── layout/         ← AppShell, Header, Sidebar
│       │   │   └── ui/             ← shadcn/ui components
│       │   │
│       │   ├── lib/
│       │   │   ├── trpc/           ← tRPC client + server
│       │   │   ├── file-processing/ ← Upload, preview, generation
│       │   │   └── hooks/          ← Custom React hooks
│       │   │
│       │   └── server/
│       │       ├── routers/        ← tRPC routers
│       │       │   ├── chat.ts
│       │       │   ├── files.ts
│       │       │   └── settings.ts
│       │       └── trpc.ts         ← tRPC init
│       │
│       ├── public/
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── package.json
│
├── reference/
│   └── ai-hub/                     ← Copy of original project for reference
│
├── docs/
│   ├── architecture.md             ← The 5,700+ line document
│   └── migration.md                ← This plan
│
├── .claude/                        ← Context for Claude Code (dogfooding)
│   ├── rules/
│   │   ├── global.md
│   │   └── frontend/
│   │       └── react.md
│   └── settings.json
│
├── CLAUDE.md                       ← Lean router for the project itself
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── README.md
```

---

## 3. Detailed Phases

### PHASE 0 — Scaffolding (3-5 days)

**Goal:** `pnpm dev` starts Next.js on localhost:3000.

```
Day 1: Repo + Monorepo
├── Create repo jesusroncal94/vibe on GitHub
├── Initialize: pnpm init + pnpm-workspace.yaml
├── Configure Turborepo: turbo.json
├── tsconfig.base.json (strict mode, paths)
├── ESLint + Prettier configs
└── .gitignore

Day 2: Base packages
├── packages/shared:
│   ├── Minimal Zod schemas (conversation, message, user, file)
│   └── Base types
│
├── packages/db:
│   ├── Drizzle ORM setup with SQLite (better-sqlite3)
│   ├── Initial schema:
│   │   ├── conversations (id, title, model, created_at, updated_at)
│   │   ├── messages (id, conversation_id, role, content, files, created_at)
│   │   ├── tags (id, name, color)
│   │   ├── conversation_tags (conversation_id, tag_id)
│   │   ├── files (id, message_id, name, type, size, path, created_at)
│   │   └── settings (key, value)
│   └── First migration

Day 3: Web app scaffold
├── apps/web: npx create-next-app (App Router, Tailwind, TypeScript)
├── Install shadcn/ui + configure theme
├── tRPC setup (server + client)
├── Base layout: sidebar placeholder + main area
├── Verify: pnpm dev → page loads
└── Verify: pnpm build → compiles without errors

Day 4: Claude Code wrapper
├── packages/claude:
│   ├── Spawn Claude Code CLI with streaming
│   ├── Parse output (JSON mode + stream mode)
│   ├── Basic tests with Vitest (mock spawn)
│   └── Verify: can send prompt and receive response

Day 5: CI + Context
├── GitHub Actions: lint + typecheck + build on PR
├── Copy ai-hub/ to reference/ai-hub/
├── Create CLAUDE.md for the repo itself
├── Create basic .claude/rules/
└── Updated README.md

Completion criteria:
  ✓ pnpm dev → Next.js on localhost:3000
  ✓ pnpm build → everything compiles
  ✓ pnpm test → Vitest runs
  ✓ packages/claude can execute Claude Code CLI
  ✓ packages/db can read/write SQLite
  ✓ CI passes on GitHub
```

---

### PHASE 1 — Web UI + Functional Chat (2-3 weeks)

**Goal:** Replace ai-hub with a professional Next.js Web UI.

#### Week 1: Layout + Basic chat

```
MAIN LAYOUT:
┌──────────────────────────────────────────────────┐
│  Header: [≡] Vibe    [Sonnet ▾]    [⚙ Settings] │
├──────────┬───────────────────────────────────────┤
│ Sidebar  │                                       │
│          │         Chat Area                     │
│ 🔍 Search│                                       │
│          │   ┌─────────────────────────────┐     │
│ + New    │   │  User: Analyze this doc     │     │
│          │   │  [📎 report.pdf]            │     │
│ Today    │   │                             │     │
│ ├─ Conv 1│   │  Claude: The report shows   │     │
│ ├─ Conv 2│   │  that sales...              │     │
│          │   └─────────────────────────────┘     │
│ Yesterday│                                       │
│ ├─ Conv 3│  ┌──────────────────────────────────┐ │
│          │  │ [📎] Message input...    [➤ Send]│ │
│ Tags:    │  └──────────────────────────────────┘ │
│ [work]   │                                       │
│ [personal│                                       │
└──────────┴───────────────────────────────────────┘

Components to build:
├── AppShell (layout with collapsible sidebar)
├── Sidebar
│   ├── SearchBar
│   ├── NewConversationButton
│   ├── ConversationList (grouped by date)
│   ├── TagFilter
│   └── ConversationItem (title, preview, timestamp)
│
├── ChatArea
│   ├── MessageList (virtual scroll if many messages)
│   ├── MessageBubble (user vs assistant, markdown rendering)
│   ├── CodeBlock (syntax highlight + copy + download button)
│   └── ThinkingIndicator (streaming "Claude is thinking...")
│
├── InputBar
│   ├── TextArea (autoexpand, Shift+Enter for new line)
│   ├── FileAttachButton (click or drag&drop)
│   ├── ModelSelector (dropdown: Sonnet, Opus, Haiku)
│   └── SendButton
│
└── Header
    ├── SidebarToggle
    ├── BrandLogo
    ├── ModelIndicator
    └── SettingsButton

tRPC Routers (week 1):
├── chat.list → list of conversations
├── chat.create → new conversation
├── chat.get → messages of a conversation
├── chat.send → send message (uses packages/claude)
├── chat.rename → rename conversation
├── chat.delete → delete conversation
├── chat.stream → SSE streaming of Claude response
└── tags.list / tags.create / tags.assign / tags.remove
```

#### Week 2: Streaming + File uploads + Model selection

```
STREAMING (critical for good UX):
├── Claude Code CLI with --output-format stream-json
├── Each chunk parsed and sent to frontend via SSE
├── Frontend renders incrementally (character by character)
├── "Thinking" indicator while Claude processes
└── Cancel button (kills the Claude Code process)

FILE UPLOADS (replicate ai-hub + improve):
├── Drag & drop in the chat area
├── Paste images from clipboard (Ctrl+V)
├── Click 📎 for file picker
├── Supported types (Phase 1):
│   ├── Images: PNG, JPG, GIF, WebP → send as base64 vision
│   ├── PDF: extract text (pdf-parse) → send as context
│   ├── DOCX: extract text (mammoth) → send as context
│   ├── XLSX/CSV: parse tables (SheetJS) → send as text
│   ├── Code files: read as plain text
│   └── Plain text: .txt, .md, .json, .yaml
│
├── Preview before sending:
│   ├── Images: thumbnail
│   ├── PDF: icon + name + pages
│   ├── DOCX: icon + name + word count
│   ├── XLSX: icon + name + sheets
│   └── Code: first lines with syntax highlight
│
├── Storage:
│   ├── uploads/ local directory
│   ├── Record in DB: files table
│   └── Association: file → message → conversation
│
└── Limits:
    ├── Max file size: 10MB (configurable)
    ├── Max files per message: 5
    └── Rejected types: executables, unknown binaries

MODEL SELECTION:
├── Dropdown in header or input bar
├── Options: claude-sonnet-4-5, claude-opus-4-5, claude-haiku-4-5
├── Default: Sonnet (good balance)
├── Persisted per conversation
└── Passed as flag: claude --model <model>
```

#### Week 3: Settings + Tags + Layouts + Polish

```
SETTINGS PAGE:
├── Appearance:
│   ├── Theme: light / dark / system
│   ├── Layout: focus / minimal / productivity (like ai-hub)
│   └── Font size
│
├── Claude Code:
│   ├── Default model
│   ├── Allowed tools (toggles: Read, Write, Bash, etc.)
│   ├── Max tokens per response
│   └── Additional system prompt (optional)
│
├── Files:
│   ├── Max upload size
│   ├── Auto-delete temporary files after X days
│   └── Uploads directory
│
└── About:
    └── Version, links, credits

3 LAYOUT MODES:
├── Focus: sidebar hidden, chat maximized
├── Minimal: compact sidebar (only icons + short titles)
└── Productivity: full sidebar + lateral file panel

TAGS:
├── Create tags with name + color
├── Assign tags to conversations
├── Filter conversations by tag in sidebar
└── Bulk operations (assign tag to multiple conversations)

POLISH:
├── Keyboard shortcuts:
│   ├── Ctrl+N → new conversation
│   ├── Ctrl+K → search conversations
│   ├── Ctrl+Shift+S → toggle sidebar
│   └── Escape → cancel Claude response
├── Responsive: work on tablet (not mobile for now)
├── Empty states (no conversations, no files, etc.)
├── Error handling (Claude Code not installed, no network, etc.)
└── Loading states (skeleton loaders, not spinners)

Phase 1 completion criteria:
  ✓ Chat with Claude works with streaming
  ✓ I can upload images and Claude sees them
  ✓ I can upload PDF/DOCX/XLSX and Claude analyzes them
  ✓ I can change models mid-conversation
  ✓ CRUD conversations with search
  ✓ Tags to organize conversations
  ✓ 3 layouts work
  ✓ Settings persist in SQLite
  ✓ Professional UI (not generic Gradio)
  ✓ Code blocks with syntax highlight + copy + download
```

---

### PHASE 2 — Advanced Documents + Generation (2-3 weeks)

**Goal:** Make document handling a clear differentiator over ai-hub.

#### Week 1: Advanced upload + Rich previews

```
MULTI-FILE UPLOAD:
├── Upload multiple files at once (batch)
├── Progress bar per file
├── Processing queue (don't block the UI)
└── Notification when processing finishes

RICH PREVIEWS (inline in chat):
├── Images: expandable thumbnail (lightbox)
├── PDF:
│   ├── Render first page (react-pdf / pdf.js)
│   ├── Show: name, pages, size
│   └── Click to expand multi-page preview
├── DOCX:
│   ├── Preview of extracted text (first ~500 chars)
│   ├── Preserve headings and structure
│   └── Show: name, word count, sections
├── XLSX:
│   ├── Table preview (first 10 rows, max 6 columns)
│   ├── Sheet selector if multiple
│   └── Show: name, sheets, rows
├── CSV/TSV:
│   ├── Inline table preview
│   └── Auto-detect delimiter + encoding
├── Code files:
│   ├── Syntax highlighted preview (first ~30 lines)
│   └── Show: name, language, lines
└── Markdown:
    ├── Rendered preview
    └── Show: name, word count

IMPROVED PROCESSING:
├── PDF with OCR (tesseract.js for scanned PDFs)
├── DOCX: extract tables in addition to text (mammoth)
├── XLSX: detect headers, types, data ranges
├── Images: auto-resize if > 5MB (sharp)
│   ├── Maintain aspect ratio
│   ├── Resize to max 2048px on the long side
│   └── Convert to WebP for storage
├── ZIP: list contents, extract text files
└── Encoding detection (chardet for non-UTF8 files)
```

#### Week 2: Document generation

```
CLAUDE GENERATES → USER DOWNLOADS:

Automatic detection in Claude responses:
├── Code blocks with filename → "Download as file" button
├── Markdown tables → "Download as XLSX" button
├── Long structured content → "Download as DOCX" button
├── Mermaid diagrams → render inline + "Download as SVG/PNG"
└── JSON/YAML → "Download as file"

Explicit generation (user requests):
├── "Generate a DOCX report" →
│   ├── Claude generates content in markdown
│   ├── System converts to DOCX (docx-js or pandoc)
│   ├── Professional format: headings, tables, page numbers
│   └── Download button inline in chat
│
├── "Generate a spreadsheet" →
│   ├── Claude structures data as JSON/table
│   ├── System converts to XLSX (SheetJS/ExcelJS)
│   ├── With formatting: bold headers, auto-width, frozen headers
│   └── Download button
│
├── "Generate a PDF" →
│   ├── Claude generates content
│   ├── System converts to PDF (puppeteer or jsPDF)
│   └── Download button
│
└── "Generate a presentation" →
    ├── Claude structures slides as JSON
    ├── System generates PPTX (pptxgenjs)
    └── Download button

CONVERSATION EXPORT:
├── Export as Markdown (.md)
├── Export as PDF (entire formatted conversation)
├── Export as DOCX
└── Include attached files as references
```

#### Week 3: File management + Polish

```
FILE GALLERY:
├── New /files page
├── Grid/list view of all files
├── Filters: by type, by conversation, by date
├── Search by name
├── Bulk delete
├── Reuse file in new conversation
│   (select from gallery instead of uploading again)
└── Storage stats: space used, files by type

LATERAL PANEL (Productivity layout):
├── Right panel with files from the current conversation
├── Click on file → expanded preview
├── Drag file from panel to input → attach
└── History of files generated by Claude in this conversation

FILE PROCESSING API (tRPC routers):
├── files.upload → process + store + metadata
├── files.list → with filters and pagination
├── files.get → download
├── files.delete → delete + cleanup storage
├── files.preview → data for inline preview
├── files.generate → generate DOCX/XLSX/PDF from content
└── files.export → export conversation

Phase 2 completion criteria:
  ✓ I upload a scanned PDF → Claude reads it (OCR)
  ✓ I upload an XLSX with 10 sheets → preview + Claude analyzes
  ✓ I upload multiple files at once with progress
  ✓ Rich inline preview for each file type
  ✓ I ask "generate a DOCX report" → I download formatted Word
  ✓ I ask for tabular data → I download as XLSX
  ✓ I export entire conversation as PDF
  ✓ File gallery with search and filters
  ✓ Lateral file panel in Productivity layout
  ✓ Mermaid diagrams render inline
```

---

## 4. npm Dependencies per Package

```
packages/shared:
├── zod                          ← schema validation
└── (no more deps, pure TypeScript)

packages/db:
├── drizzle-orm                  ← ORM
├── drizzle-kit                  ← migrations (dev)
├── better-sqlite3               ← SQLite driver
└── @types/better-sqlite3

packages/claude:
├── (only Node.js child_process, no external deps)
└── zod (to validate output)

apps/web:
├── next                         ← Framework
├── react + react-dom
├── @trpc/server + @trpc/client + @trpc/next
├── tailwindcss                  ← Styling
├── @shadcn/ui (components)
├── lucide-react                 ← Icons
├── react-markdown + remark-gfm  ← Markdown rendering
├── react-syntax-highlighter     ← Code blocks
├── react-dropzone               ← File drag & drop
├── mammoth                      ← DOCX → text
├── pdf-parse                    ← PDF → text
├── xlsx (SheetJS)               ← XLSX/CSV → data
├── sharp                        ← Image processing (server)
├── react-pdf                    ← PDF preview (client)
├── mermaid                      ← Diagram rendering
├── docx (docx-js)               ← DOCX generation (Phase 2)
├── exceljs                      ← XLSX generation (Phase 2)
├── pptxgenjs                    ← PPTX generation (Phase 2)
├── pino                         ← Logging
└── zustand                      ← Client state management

Dev dependencies (root):
├── turborepo                    ← Monorepo orchestration
├── typescript
├── vitest                       ← Testing
├── @testing-library/react       ← Component tests
├── eslint + prettier
└── @types/*
```

---

## 5. Claude Code CLI Integration — Technical Details

```typescript
// packages/claude/src/client.ts — Implementation example

import { spawn } from 'child_process';

interface ClaudeOptions {
  model?: 'claude-sonnet-4-5' | 'claude-opus-4-5' | 'claude-haiku-4-5';
  allowedTools?: string[];        // ['Read', 'Write', 'Bash', etc.]
  maxTokens?: number;
  systemPrompt?: string;
}

interface ClaudeStreamChunk {
  type: 'text' | 'tool_use' | 'tool_result' | 'error' | 'done';
  content: string;
  metadata?: Record<string, unknown>;
}

// Streaming: each chunk is emitted as an event
function streamChat(
  prompt: string,
  files: string[],       // paths to attached files
  options: ClaudeOptions
): AsyncIterable<ClaudeStreamChunk> {

  const args = [
    '--print',                              // non-interactive mode
    '--output-format', 'stream-json',       // streaming JSON chunks
    '--model', options.model ?? 'claude-sonnet-4-5',
  ];

  // Allowed tools
  if (options.allowedTools?.length) {
    args.push('--allowedTools', options.allowedTools.join(','));
  }

  // System prompt
  if (options.systemPrompt) {
    args.push('--system-prompt', options.systemPrompt);
  }

  // Prompt with referenced files
  let fullPrompt = prompt;
  if (files.length > 0) {
    // Claude Code can read files if you give it the paths
    const fileRefs = files.map(f => `[Attached file: ${f}]`).join('\n');
    fullPrompt = `${fileRefs}\n\n${prompt}`;
  }

  args.push(fullPrompt);

  const process = spawn('claude', args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  // ... parse stdout line by line, yield ClaudeStreamChunk
}
```

```
Key Claude Code CLI flags:
├── --print                → non-interactive mode (stdin → stdout)
├── --output-format json   → complete response as JSON
├── --output-format stream-json → JSON chunks per line
├── --model <model>        → select model
├── --allowedTools <list>  → allowed tools (security)
├── --system-prompt <text> → additional system prompt
├── --max-turns <n>        → maximum agentic turns
└── --verbose              → detailed logging

For image files (vision):
├── Claude Code CLI supports passing images directly
├── Images are sent as part of the prompt
└── Format: claude --print "Analyze this image" < image.png
    Or via the Read tool that Claude Code itself executes
```

---

## 6. Database Schema (Phases 0-1)

```typescript
// packages/db/src/schema/index.ts

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(),              // nanoid
  title: text('title').notNull(),
  model: text('model').default('claude-sonnet-4-5'),
  layout: text('layout').default('minimal'), // focus | minimal | productivity
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  model: text('model'),                     // model used for this response
  tokensIn: integer('tokens_in'),
  tokensOut: integer('tokens_out'),
  durationMs: integer('duration_ms'),       // how long Claude took
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  messageId: text('message_id')
    .references(() => messages.id, { onDelete: 'set null' }),
  conversationId: text('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),          // bytes
  path: text('path').notNull(),             // filesystem path
  type: text('type', { enum: [             // processed type
    'image', 'pdf', 'docx', 'xlsx', 'csv', 'code', 'text', 'other'
  ]}).notNull(),
  metadata: text('metadata', { mode: 'json' }), // {pages, sheets, words, etc.}
  direction: text('direction', { enum: ['upload', 'generated'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').default('#6366f1'),  // hex color
});

export const conversationTags = sqliteTable('conversation_tags', {
  conversationId: text('conversation_id')
    .references(() => conversations.id, { onDelete: 'cascade' }),
  tagId: text('tag_id')
    .references(() => tags.id, { onDelete: 'cascade' }),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
});

// ---- PREPARED FOR FUTURE (not active in Phase 1) ----

export const enterprises = sqliteTable('enterprises', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  settings: text('settings', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  enterpriseId: text('enterprise_id')
    .references(() => enterprises.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  path: text('path'),                       // filesystem path
  stack: text('stack', { mode: 'json' }),   // {frontend, backend, etc.}
  settings: text('settings', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
```

---

## 7. Immediate Actions — This Week

```
Day 1:
  [ ] Create repo github.com/jesusroncal94/vibe
  [ ] git init + pnpm init + turbo.json + pnpm-workspace.yaml
  [ ] tsconfig.base.json
  [ ] ESLint + Prettier
  [ ] Commit: "chore: initialize monorepo"

Day 2:
  [ ] packages/shared — Zod schemas + types
  [ ] packages/db — Drizzle + SQLite + schema + first migration
  [ ] Commit: "feat: add shared schemas and database package"

Day 3:
  [ ] apps/web — Next.js 15 scaffold + shadcn/ui + Tailwind
  [ ] Base layout (AppShell + Sidebar placeholder + Chat placeholder)
  [ ] Verify: pnpm dev works
  [ ] Commit: "feat: scaffold web app with Next.js 15"

Day 4:
  [ ] packages/claude — CLI wrapper with streaming
  [ ] First tRPC router: chat.send (connects web → claude wrapper)
  [ ] Verify: can send a prompt from the web and see response
  [ ] Commit: "feat: Claude Code CLI wrapper + first chat endpoint"

Day 5:
  [ ] GitHub Actions CI
  [ ] Copy reference/ai-hub
  [ ] CLAUDE.md + .claude/rules/ for the repo
  [ ] Updated README.md
  [ ] Commit: "chore: CI, reference project, CLAUDE.md"

→ END OF PHASE 0: the most basic chat works on localhost
```

---

## 8. What NOT to do now

```
Things that are in the architecture but NOT done in Phases 0-2:
├── ✗ Multi-enterprise (tables prepared but no UI)
├── ✗ Complex auth (Better Auth comes in Phase 3+)
├── ✗ MCP servers (come in Phase 4)
├── ✗ Claude Code hooks (come in Phase 4)
├── ✗ Plugin system (comes in Phase 5)
├── ✗ Agent SDK (comes when you scale)
├── ✗ CLI vibe (comes in Phase 4)
├── ✗ CI/CD workers (come in Phase 5)
├── ✗ Visual regression (comes in Phase 5)
├── ✗ PostgreSQL (SQLite is sufficient for 1 user)
├── ✗ Redis / BullMQ (no background jobs yet)
├── ✗ Complex admin panel (you're the only user)
└── ✗ Cloud deployment (localhost is sufficient)

The goal is: functionality > perfect architecture.
Build what you need TODAY, with the right structure
so that when you need the above, it's plug-and-play.
```
