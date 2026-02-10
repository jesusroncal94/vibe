'use client';

import { MessageSquare, Zap, Code2, FileText } from 'lucide-react';

interface EmptyStateProps {
  onSuggestionClick?: (prompt: string) => void;
}

const suggestions = [
  { icon: Code2, text: 'Help me write a React component' },
  { icon: FileText, text: 'Explain this code to me' },
  { icon: Zap, text: 'Debug an issue in my project' },
];

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Start a conversation</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask Claude anything about your code, debug issues, or get help with your projects.
        </p>
      </div>

      <div className="grid w-full max-w-md gap-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.text}
            onClick={() => onSuggestionClick?.(suggestion.text)}
            className="flex items-center gap-3 rounded-lg border bg-card p-4 text-left text-sm transition-colors hover:bg-accent"
          >
            <suggestion.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span>{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
