# Vibe

Multi-enterprise vibe coding platform for Claude Code.

> 🚧 **Under active development** — Finishing Phase 2 (Advanced Documents)

## What is it

A professional web platform that replaces the ai-hub Python/Gradio prototype. Manages conversations, files, and tools for Claude Code-assisted development. Designed to scale to multiple enterprises and projects.

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 LTS + TypeScript 5.x (strict) |
| Monorepo | Turborepo 2.x + pnpm workspaces |
| Web UI | Next.js 15 (App Router) + Tailwind CSS 4 + shadcn/ui |
| API | tRPC + React Query |
| Database | SQLite (better-sqlite3) |
| State | zustand (persisted) |
| Claude | Claude Code CLI via child_process (streaming JSON) |
| Testing | Vitest |

## Quick Start

```bash
# Requirements: Node.js 22+, pnpm 9+, Claude Code CLI installed
pnpm install
pnpm dev
# → http://localhost:3000
```

## Structure

```
packages/shared/    → Zod schemas, types, shared utilities
packages/db/        → SQLite schema + queries (auto-creates tables)
packages/claude/    → Claude Code CLI wrapper (spawn + streaming)
apps/web/           → Next.js 15 Web UI (App Router)
docs/               → Architecture + migration plan
reference/ai-hub/   → Original prototype (read-only)
```

## Features

- **Chat with Claude Code** — Real-time streaming, markdown rendering, syntax-highlighted code blocks, mermaid diagrams
- **File uploads** — Drag & drop, clipboard paste, PDF/DOCX/XLSX/CSV/image support with text extraction
- **Document generation** — Ask Claude to generate DOCX, XLSX, or PDF files, download inline
- **Conversation export** — Export as PDF, DOCX, or XLSX
- **File gallery** — Grid/list view, search, filter by type, batch operations, storage stats
- **OCR** — Extract text from scanned PDFs via tesseract.js
- **3 layout modes** — Focus (no sidebar), Minimal, Productivity (sidebar + file panel)
- **Model selection** — Switch between Sonnet, Opus, and Haiku
- **Internet access toggle** — Enable/disable web search and fetch tools
- **Tags** — Organize conversations with colored tags
- **Settings** — Theme, layout, model, system prompt, internet access
- **Keyboard shortcuts** — Ctrl+N (new chat), Ctrl+K (search), Ctrl+Shift+S (sidebar), Escape (cancel)

## Documentation

- [Full architecture](docs/architecture.md) — 5,700+ lines of detailed design
- [Migration plan](docs/migration-plan.md) — Phases, schema, technical decisions

## Roadmap

- [x] Architecture document
- [x] Migration plan
- [x] **Phase 0:** Scaffold monorepo
- [x] **Phase 1:** Web UI + Chat with Claude Code
- [~] **Phase 2:** Advanced document handling (90%)
- [ ] **Phase 3:** Multi-enterprise + intelligent context
- [ ] **Phase 4:** CLI `vibe` + hooks + MCP servers
- [ ] **Phase 5+:** Plugins, Agent SDK, enterprise

## Origin

Evolution of [ai-hub](https://github.com/jesusroncal94/ai-hub), a Python/Gradio prototype that validated the concept of multimodal chat with Claude Code.

## License

MIT
