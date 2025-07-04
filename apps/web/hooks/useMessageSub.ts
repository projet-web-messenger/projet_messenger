"use client";

import { MESSAGE_RECEIVED } from "@/graphql/subscriptions";
import { Message } from "@/types/graphql";
import { useSubscription } from "@apollo/client";

interface UseMessageSubProps {
  onMessageReceived?: (message: Message) => void;
  conversationId?: number;
}

export function useMessageSub({ onMessageReceived, conversationId }: UseMessageSubProps) {
  //Sub pr tous les msg
  const { data, loading, error } = useSubscription(MESSAGE_RECEIVED, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.messageReceived) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.log("🔔 Nouveau message reçu via subscription:", subscriptionData.data.messageReceived);

        const message = subscriptionData.data.messageReceived;
        // Si on a un conversationId spécifique, filtrer les messages
        if (!conversationId || message.conversationId === conversationId) {
          onMessageReceived?.(message);
        }
      }
    },
    onError: (error) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("❌ Erreur subscription:", error);
    },
  });
  return {
    data,
    loading,
    error,
  };
}
