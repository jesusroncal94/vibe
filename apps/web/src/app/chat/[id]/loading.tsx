import { Skeleton } from '@/components/ui/skeleton';

export default function ChatConversationLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex gap-3 justify-end">
          <div className="space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-80" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <div className="space-y-2">
            <Skeleton className="h-4 w-52" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-20 w-96 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="border-t p-4">
        <div className="mx-auto max-w-3xl">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
