"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useQueueSubscriber(conversationId?: string) {
  const router = useRouter();

  useEffect(() => {
    const eventSource = new EventSource("/api/rabbitmq/consume");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Queue data received:", data);

      // Perform refresh based on message type
      if (data.type === "MESSAGE_CREATED" || data.type === "MESSAGE_UPDATED") {
        // Only refresh if it's the current conversation
        if (conversationId && data.conversationId === conversationId) {
          router.refresh();
        }
      }

      if (data.type === "CONVERSATION_CREATED") {
        // Refresh conversations list
        router.refresh();
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [conversationId, router]);
}
