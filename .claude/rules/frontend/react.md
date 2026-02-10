# Frontend Rules — Next.js + React

> Applies to: `apps/web/src/**/*.{ts,tsx}`

## Next.js App Router

- Use App Router (not Pages Router). Each route is a directory with `page.tsx`.
- Server Components by default. `"use client"` only when interactivity is needed.
- Shared layouts in `layout.tsx`. Don't duplicate headers/sidebars.
- Loading states with `loading.tsx`. Error boundaries with `error.tsx`.
- API routes only for external webhooks. Everything else via tRPC.

## React Components

- Functional components with named exports: `export function ChatArea() {}`.
- Props as interface: `interface ChatAreaProps { ... }`.
- Custom hooks in `lib/hooks/` with `use` prefix: `useConversations()`.
- Base UI components from shadcn/ui. Don't reinvent buttons, inputs, modals.
- Custom components in `components/` organized by feature: `chat/`, `sidebar/`, `files/`.

## Styling

- Tailwind CSS utility classes directly in JSX.
- Don't create separate CSS files except for globals.
- Use `cn()` (clsx + tailwind-merge) for conditional classes.
- Design tokens via shadcn/ui theme CSS variables.
- Responsive: mobile-first is not a priority (desktop-first, work on tablet).

## State Management

- Server state: tRPC + React Query (cache, invalidation, optimistic updates).
- Client state: zustand (UI state like sidebar open, active layout, etc.).
- Don't use Context API for global state. Context only for dependency injection.
- Don't use Redux. Don't use Jotai/Recoil.

## Performance

- Lazy load heavy components with Next.js `dynamic()`.
- Images with `next/image` for automatic optimization.
- Virtualize long lists (chat messages) if they exceed ~100 items.
- Don't install large libraries for simple features (no lodash if you only need debounce).
