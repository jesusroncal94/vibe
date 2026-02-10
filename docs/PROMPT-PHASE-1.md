# Prompt for Claude Code Web — PHASE 1 (Functional Chat)

> **Use AFTER completing Phase 0.**
> Can be split into 3 sessions (one per week).

---

## SESSION 1A — Layout + Basic chat

Read CLAUDE.md and `docs/migration-plan.md` section "PHASE 1, Week 1".

Implement the main layout and basic chat:

### Layout (AppShell)
- Collapsible sidebar (left): list of conversations grouped by date, search bar, "New Chat" button, tag filters
- Chat area (center): message list with markdown rendering, code blocks with syntax highlight
- Header: sidebar toggle, brand "Vibe", model selector dropdown, settings button
- 3 layout modes: Focus (no sidebar), Minimal (compact sidebar), Productivity (full sidebar)
- Persist layout mode in DB settings
- Keyboard shortcuts: Ctrl+N (new chat), Ctrl+K (search), Ctrl+Shift+S (toggle sidebar)

### Functional chat
- Input bar: autoexpand textarea, send button, file attach button (placeholder), model selector
- Send message → call packages/claude → streamChat → show response incrementally
- Real streaming: Claude Code CLI with --output-format stream-json, SSE to frontend
- "Claude is thinking..." indicator while processing
- Cancel button to kill the Claude Code process
- Code blocks: syntax highlighting (react-syntax-highlighter), copy button, download button
- Full markdown rendering (react-markdown + remark-gfm)

### tRPC Routers
- chat.list → list of conversations with last message
- chat.create → new conversation
- chat.get → messages of a conversation
- chat.send → send message (streaming via SSE)
- chat.rename → rename conversation
- chat.delete → delete conversation

### Sidebar
- ConversationList: grouped by "Today", "Yesterday", "Last 7 days", "Older"
- Search: filter conversations by title or content
- ConversationItem: title, last message preview, timestamp, tag badges
- Right-click menu: rename, delete, add tag
- Empty state when no conversations

Make incremental commits with descriptive messages.

---

## SESSION 1B — File uploads + Model selection

Read CLAUDE.md and `docs/migration-plan.md` section "PHASE 1, Week 2".

### File uploads
- Drag & drop in the chat area (react-dropzone)
- Paste images from clipboard (Ctrl+V)
- Click 📎 for file picker
- Supported types:
  - Images (PNG, JPG, GIF, WebP) → thumbnail preview, send as vision
  - PDF → extract text (pdf-parse), show icon + name + pages
  - DOCX → extract text (mammoth), show icon + name
  - XLSX/CSV → parse (SheetJS), show icon + name + sheets
  - Code files → read as text, syntax highlighted preview
  - Plain text (.txt, .md, .json, .yaml)
- Preview before sending in chips below the input
- Storage in uploads/ with record in DB (files table)
- Limits: 10MB max, 5 files per message

### Model selection
- Dropdown: claude-sonnet-4-5 (default), claude-opus-4-5, claude-haiku-4-5
- Persisted per conversation in DB
- Passed as --model flag to CLI wrapper
- Visual indicator of active model in header

### File downloads
- Detect code blocks with filename in Claude responses
- "Download" button per code block
- Detect tables → "Download as CSV"

Install necessary dependencies: react-dropzone, mammoth, pdf-parse, xlsx (SheetJS), sharp, react-syntax-highlighter.

---

## SESSION 1C — Settings + Tags + Polish

Read CLAUDE.md and `docs/migration-plan.md` section "PHASE 1, Week 3".

### Settings page (/settings)
- Appearance: theme (light/dark/system), default layout, font size
- Claude Code: default model, allowed tools (toggles), additional system prompt
- Files: max upload size, auto-delete days
- Persist in DB via settings table

### Tags
- tRPC: tags.list, tags.create, tags.delete, tags.assign, tags.remove
- UI: create tags with name + color (color picker)
- Assign tags to conversations (dropdown in sidebar item)
- Filter conversations by tag in sidebar
- Tag badges in conversation items

### Polish
- Empty states for all views
- Error handling: Claude Code not installed, dead process, timeout
- Loading states with skeleton loaders (shadcn/ui Skeleton)
- Responsive: work on tablet (min-width 768px)
- Keyboard shortcut hints in tooltips
- Favicon + meta tags

Verify everything works end-to-end: create conversation → chat → upload file → change model → tag → settings.
