'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ChatError({ error, reset }: ErrorProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div className="text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred while loading the chat.'}
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
