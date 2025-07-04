"use client";

import { useQueueSubscriber } from "./useQueueSubscriber";

interface QueueProviderProps {
  conversationId?: string;
  children: React.ReactNode;
}

export function QueueProvider({ conversationId, children }: QueueProviderProps) {
  useQueueSubscriber(conversationId);

  return <>{children}</>;
}
