# Vibe Platform — Claude Code Context

> **Current Phase: 2 (Advanced Documents — finishing)**
> **Owner:** Jesus Roncal (jesus@mindfortress.com)
> **Stack:** TypeScript monorepo (Turborepo + pnpm)

## What is this project

Multi-enterprise management platform for vibe coding with Claude Code. Professional Web UI (Next.js) that replaces a Python/Gradio prototype (ai-hub). Backend uses Claude Code CLI (Max Plan $100/month, no extra API cost).

## Reference documentation

- **Full architecture (5,700+ lines):** `docs/architecture.md` — read it when you need deep context on decisions, building blocks, or future features.
- **Definitive migration plan:** `docs/migration-plan.md` — phases, DB schema, monorepo structure, npm dependencies, CLI wrapper technical details.
- **Original prototype reference:** `reference/ai-hub/` — Python/Gradio project that validated the idea. DO NOT copy code, only consult concepts and UX.

## Tech stack

```
Runtime:        Node.js 22 LTS + TypeScript 5.x (strict)
Monorepo:       Turborepo 2.x + pnpm workspaces
Web UI:         Next.js 15 (App Router) + Tailwind CSS 4 + shadcn/ui
API:            tRPC (server + client)
Database:       Drizzle ORM + SQLite (better-sqlite3)
Claude:         Claude Code CLI via child_process.spawn (streaming JSON)
State (client): zustand
Testing:        Vitest + @testing-library/react
Logging:        pino
IDs:            nanoid
```

## Monorepo structure

```
packages/shared/    → Zod schemas, types, shared utilities
packages/db/        → Drizzle ORM + SQLite schema + queries
packages/claude/    → Claude Code CLI wrapper (spawn + streaming)
apps/web/           → Next.js 15 Web UI (App Router)
docs/               → Architecture + migration plan
reference/ai-hub/   → Original prototype (read-only)
```

## Code conventions

- **Language:** Strict TypeScript. Never `any`. Use Zod for runtime validation.
- **Imports:** Path aliases `@vibe/shared`, `@vibe/db`, `@vibe/claude` between packages.
- **Exports:** Barrel exports via `index.ts` in each package.
- **Naming:** camelCase for variables/functions, PascalCase for types/components, kebab-case for files.
- **Components:** Functional components with named exports. Props as interface, not type.
- **Styling:** Tailwind CSS utility classes. shadcn/ui for base components. No CSS-in-JS.
- **State:** zustand for client state. tRPC + React Query for server state.
- **Errors:** Never `console.log` in production. Use pino logger.
- **Tests:** Vitest. `.test.ts` files alongside the tested file.
- **Commits:** Conventional Commits (feat:, fix:, chore:, docs:).

## Path-scoping rules

See `.claude/rules/` for specific instructions per code area.

## Current phase and immediate goal

**PHASE 0:** Complete. Monorepo scaffold, all packages, CI, build, tests.
**PHASE 1:** Complete. Chat with streaming, file uploads, tags, 3 layouts, settings, keyboard shortcuts.
**PHASE 2:** ~90% complete. OCR, rich previews, DOCX/XLSX/PDF generation, file gallery, conversation export, mermaid diagrams.

**Remaining Phase 2 items:** ZIP file handling, encoding detection, PPTX generation, drag-from-panel-to-input, reuse files from gallery, error boundaries, loading skeletons.

**PHASE 3 (next):** Multi-enterprise + intelligent context.

See `docs/migration-plan.md` for the details of each phase.

## What NOT to do now

- Do not implement multi-enterprise (tables prepared in schema but no UI)
- Do not implement complex auth (single user for now)
- Do not use Anthropic API directly (use Claude Code CLI)
- Do not create MCP servers, hooks, or plugins (Phases 4+)
- Do not over-optimize — functionality > perfect architecture
