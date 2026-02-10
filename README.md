# Vibe

Multi-enterprise vibe coding platform for Claude Code.

> 🚧 **Under active development** — Phase 0 (Scaffolding)

## What is it

A web platform that manages context, history, and tools for Claude Code-assisted development. Designed to handle multiple enterprises and projects with intelligent context hierarchy.

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 LTS + TypeScript 5.x |
| Monorepo | Turborepo + pnpm |
| Web UI | Next.js 15 (App Router) + shadcn/ui |
| API | tRPC |
| Database | Drizzle ORM + SQLite |
| Claude | Claude Code CLI (streaming) |
| Testing | Vitest + Playwright |

## Quick Start

```bash
# Requirements: Node.js 22+, pnpm 9+, Claude Code CLI
pnpm install
pnpm dev
# → http://localhost:3000
```

## Structure

```
packages/shared/    → Shared types and schemas (Zod)
packages/db/        → Drizzle ORM + SQLite
packages/claude/    → Claude Code CLI wrapper
apps/web/           → Next.js Web UI
```

## Documentation

- [Full architecture](docs/architecture.md) — 5,700+ lines of detailed design
- [Migration plan](docs/migration-plan.md) — Phases, schema, technical decisions

## Roadmap

- [x] Architecture document
- [x] Migration plan
- [ ] **Phase 0:** Scaffold monorepo
- [ ] **Phase 1:** Web UI + Chat with Claude Code
- [ ] **Phase 2:** Advanced document handling
- [ ] **Phase 3:** Multi-enterprise + intelligent context
- [ ] **Phase 4:** CLI `vibe` + hooks + MCP servers
- [ ] **Phase 5+:** Plugins, Agent SDK, enterprise

## Origin

Evolution of [ai-hub](https://github.com/jesusroncal94/ai-hub), a Python/Gradio prototype that validated the concept of multimodal chat with Claude Code.

## License

MIT
