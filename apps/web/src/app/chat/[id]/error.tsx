'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ChatConversationError({ error, reset }: ErrorProps) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div className="text-center">
        <h2 className="text-lg font-semibold">Failed to load conversation</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {error.message || 'The conversation could not be found or an error occurred.'}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push('/chat')}>
          New chat
        </Button>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
