'use client';

import { MessageSquarePlus } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm font-medium text-muted-foreground">Conversations</span>
        <button className="p-1.5 rounded-md hover:bg-secondary" aria-label="New chat">
          <MessageSquarePlus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        <p className="p-4 text-sm text-muted-foreground">No conversations yet</p>
      </div>
    </aside>
  );
}
