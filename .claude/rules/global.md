# Global Rules — Vibe Platform

## Monorepo

- All packages use TypeScript strict with `noUncheckedIndexedAccess`.
- Dependencies between internal packages use workspace protocol: `"@vibe/shared": "workspace:*"`.
- Turborepo handles build order automatically via dependencies in package.json.
- Never install dependencies in the root except shared devDependencies (ESLint, Prettier, TypeScript).
- Each package has its own `tsconfig.json` that extends `../../tsconfig.base.json`.

## TypeScript

- `strict: true` always. Never disable checks.
- Never use `any`. Use `unknown` + type narrowing if the type is uncertain.
- Prefer `interface` over `type` for objects. `type` for unions and aliases.
- Zod schemas as source of truth for validation. Infer types with `z.infer<typeof schema>`.
- Use `as const` satisfies for literal objects that need exact inference.

## Errors and logging

- Never `console.log/warn/error` — use pino logger.
- Never empty `try {} catch(e) {}` — always log or re-throw.
- User errors (invalid input) → return error object, don't throw.
- System errors (DB failed, Claude crashed) → throw + log.

## Git

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- One commit per logical change. No mega-commits.
- Branch naming: `feat/description`, `fix/description`, `chore/description`.

## Security

- Never hardcode secrets. Use environment variables.
- Never expose user filesystem paths in HTTP responses.
- Validate all user input with Zod before processing.
- Sanitize uploaded file names (never trust the original name).
