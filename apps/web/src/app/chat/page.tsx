import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Chat coming in Phase 1</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The chat interface with Claude Code streaming will be implemented next.
        </p>
      </div>
    </div>
  );
}
