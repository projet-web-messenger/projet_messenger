"use client";

import { gql, useQuery } from "@apollo/client";

// ✅ Types pour TypeScript
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  title?: string;
  participants: User[];
}

// ✅ Query pour récupérer une conversation avec ses participants
const GET_CONVERSATION_BY_ID = gql`
  query GetConversationById($conversationId: Int!) {
    conversationById(conversationId: $conversationId) {
      id
      title
      participants {
        id
        name
        email
        createdAt
      }
    }
  }
`;

export function useConversation(conversationId?: number) {
  const { data, loading, error, refetch } = useQuery(GET_CONVERSATION_BY_ID, {
    variables: { conversationId },
    skip: !conversationId,
    onCompleted: (data) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("✅ Conversation récupérée:", data.conversationById);
    },
    onError: (error) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("❌ Erreur récupération conversation:", error);
    },
  });

  const conversation: Conversation | null = data?.conversationById || null;

  return {
    conversation,
    participants: conversation?.participants || [],
    loading,
    error,
    refetch,
  };
}
