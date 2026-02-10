'use client';

import { use } from 'react';
import { ChatView } from '@/components/chat/chat-view';

interface ChatConversationPageProps {
  params: Promise<{ id: string }>;
}

export default function ChatConversationPage({ params }: ChatConversationPageProps) {
  const { id } = use(params);

  return <ChatView conversationId={id} />;
}
