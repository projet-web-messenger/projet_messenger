"use client";

import { useMutation, useQuery } from "@apollo/client";
import { gql } from "@apollo/client";

// ✅ Types pour TypeScript
interface User {
  id: number;
  name: string;
  email: string;
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  sender: User;
  conversationId: number;
}

// ✅ Query qui existe dans votre backend
const GET_MESSAGES_BY_CONVERSATION = gql`
  query MessagesByConversation($conversationId: Int!) {
    messagesByConversation(conversationId: $conversationId) {
      id
      content
      createdAt
      senderId
      sender {
        id
        name
        email
      }
      conversationId
    }
  }
`;

// ✅ Query alternative qui existe aussi
const GET_MESSAGES_BETWEEN_USERS = gql`
  query GetMessagesBetweenUsers($user1Id: Float!, $user2Id: Float!) {
    getMessagesBetweenUsers(user1Id: $user1Id, user2Id: $user2Id) {
      id
      content
      createdAt
      senderId
      sender {
        id
        name
        email
      }
      conversationId
    }
  }
`;

// ✅ Mutation pour envoyer un message direct
const SEND_DIRECT_MESSAGE = gql`
  mutation SendDirectMessage(
    $senderId: Float!
    $receiverId: Float!
    $content: String!
  ) {
    sendDirectMessage(
      senderId: $senderId
      receiverId: $receiverId
      content: $content
    ) {
      id
      content
      createdAt
      sender {
        id
        name
      }
    }
  }
`;

// ✅ Mutation pour envoyer un message dans une conversation
const SEND_MESSAGE = gql`
  mutation SendMessage(
    $senderId: Float!
    $content: String!
    $conversationId: Float!
  ) {
    sendMessage(
      senderId: $senderId
      content: $content
      conversationId: $conversationId
    ) {
      id
      content
      createdAt
      sender {
        id
        name
      }
    }
  }
`;

export function useMessages(conversationId?: number, user1Id?: number, user2Id?: number) {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log("🔍 useMessages appelé avec:", {
    conversationId,
    user1Id,
    user2Id,
  });

  // const [messages, setMessages] = useState<Message[]>([]);

  // ✅ Si on a un conversationId, on utilise messagesByConversation
  const {
    data: conversationData,
    loading: conversationLoading,
    error: conversationError,
    refetch: refetchConversation,
  } = useQuery(GET_MESSAGES_BY_CONVERSATION, {
    variables: { conversationId },
    skip: !conversationId, // Skip si pas de conversationId
    fetchPolicy: "cache-and-network", // Pour toujours essayer de récupérer les données du cache d'abord
    onCompleted: (data) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("✅ Messages de conversation récupérés:", data.messagesByConversation);
      // setMessages(data.messagesByConversation || []);
    },
    onError: (error) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("❌ Erreur conversation:", error);
    },
  });

  // ✅ Si on a user1Id et user2Id, on utilise getMessagesBetweenUsers
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery(GET_MESSAGES_BETWEEN_USERS, {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    variables: { user1Id: user1Id!, user2Id: user2Id! },
    skip: !user1Id || !user2Id, // Skip si pas les deux IDs
    fetchPolicy: "cache-and-network", // Pour toujours essayer de récupérer les données du cache d'abord
    onCompleted: (data) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("✅ Messages entre utilisateurs récupérés:", data.getMessagesBetweenUsers);
      // setMessages(data.getMessagesBetweenUsers || []);
    },
    onError: (error) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("❌ Erreur utilisateurs:", error);
    },
  });

  // ✅ Mutation pour envoyer un message dans une conversation
  const [sendMessageMutation, { loading: sendLoading }] = useMutation(SEND_MESSAGE, {
    // ✅ AJOUTÉ - Refetch spécifique après mutation
    refetchQueries: [
      {
        query: GET_MESSAGES_BY_CONVERSATION,
        variables: { conversationId },
      },
    ],
    awaitRefetchQueries: true, // ✅ Attend le refetch avant de continuer
    onCompleted: (data) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("✅ Message envoyé:", data.sendMessage);
      // Refetch les messages après envoi
      setTimeout(() => {
        if (conversationId) {
          refetchConversation();
        }
      }, 200);
    },
    onError: (error) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("❌ Erreur envoi message:", error);
    },
  });

  // ✅ Mutation pour envoyer un message direct
  const [sendDirectMessageMutation] = useMutation(SEND_DIRECT_MESSAGE, {
    // ✅ AJOUTÉ - Refetch spécifique après mutation
    refetchQueries: [
      {
        query: GET_MESSAGES_BETWEEN_USERS,
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        variables: { user1Id: user1Id!, user2Id: user2Id! },
      },
    ],
    awaitRefetchQueries: true, // ✅ Attend le refetch avant de continuer
    onCompleted: (data) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("✅ Message direct envoyé:", data.sendDirectMessage);
      // Refetch les messages après envoi
      // ✅ MODIFIÉ - Refetch automatique après envoi
      setTimeout(() => {
        if (user1Id && user2Id) {
          refetchUsers();
        }
      }, 200);
    },
    onError: (error) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("❌ Erreur envoi message direct:", error);
    },
  });

  // ✅ Fonction pour envoyer un message
  const sendMessage = async (content: string, senderId: number) => {
    try {
      if (conversationId) {
        // Envoyer dans une conversation existante
        await sendMessageMutation({
          variables: {
            senderId: senderId,
            content,
            conversationId: conversationId,
          },
        });
      } else if (user1Id && user2Id) {
        // Envoyer un message direct (créera une conversation si nécessaire)
        const receiverId = senderId === user1Id ? user2Id : user1Id;
        await sendDirectMessageMutation({
          variables: {
            senderId: senderId,
            receiverId,
            content,
          },
        });
      } else {
        throw new Error("Impossible d'envoyer le message : conversationId ou user1Id/user2Id requis");
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("❌ Erreur lors de l'envoi:", error);
      throw error;
    }
  };

  // ✅ Fonction de refetch unifiée
  const refetch = () => {
    if (conversationId) {
      refetchConversation();
    } else if (user1Id && user2Id) {
      refetchUsers();
    }
  };

  // ✅ État unifié
  const loading = conversationLoading || usersLoading;
  const error = conversationError || usersError;
  // ✅ Messages proviennent directement d'Apollo (pas d'état local)
  const messages = conversationData?.messagesByConversation || usersData?.getMessagesBetweenUsers || [];

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendLoading,
    refetch,
  };
}
