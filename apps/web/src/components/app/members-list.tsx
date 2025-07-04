"use client";

import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { useMemo } from "react";

interface MembersListProps {
  conversationId?: number;
}

// ✅ Query simple pour récupérer les utilisateurs de la conversation
const GET_CONVERSATION_USERS = gql`
  query GetConversationUsers($conversationId: Int!) {
    messagesByConversation(conversationId: $conversationId) {
      sender {
        id
        name
        email
      }
    }
  }
`;

export function MembersList({ conversationId }: MembersListProps) {
  const { data, loading, error } = useQuery(GET_CONVERSATION_USERS, {
    variables: { conversationId },
    skip: !conversationId,
    onCompleted: (data) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("✅ Messages récupérés pour membres:", data);
    },
    onError: (error) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("❌ Erreur récupération membres:", error);
    },
  });

  // ✅ Extraire les utilisateurs uniques des messages
  const participants = useMemo(() => {
    // biome-ignore lint/style/useBlockStatements: <explanation>
    if (!data?.messagesByConversation) return [];

    const uniqueUsers = new Map();
    // biome-ignore lint/complexity/noForEach: <explanation>
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    data.messagesByConversation.forEach((message: any) => {
      if (message.sender) {
        uniqueUsers.set(message.sender.id, message.sender);
      }
    });

    return Array.from(uniqueUsers.values());
  }, [data]);

  // ✅ Fonction pour déterminer le statut (simulation)
  const getStatus = (userId: number) => {
    const statuses = ["online", "away", "offline"];
    return statuses[userId % 3];
  };

  // ✅ Fonction pour obtenir un avatar emoji basé sur l'ID
  const getAvatar = (userId: number) => {
    const avatars = ["🧑‍💻", "👩‍💼", "👨‍🔬", "👩‍🎨", "🧑‍🚀", "👨‍🏫", "👩‍⚕️", "🧑‍🍳"];
    return avatars[userId % avatars.length];
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-2 p-2">
            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="flex-1">
              <div className="mb-1 h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600" />
              <div className="h-3 w-1/2 rounded bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 text-sm dark:text-red-400">
          Erreur lors du chargement des membres
        </div>
        <div className="mt-1 text-gray-400 text-xs">{error.message}</div>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500 text-sm dark:text-gray-400">
          Aucun membre dans cette conversation
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header avec nombre de membres */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm dark:text-white">
          👥 Membres
        </h3>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600 text-xs dark:bg-gray-700 dark:text-gray-300">
          {participants.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
        {participants.map((member: any) => {
          const status = getStatus(Number(member.id));
          const avatar = getAvatar(Number(member.id));

          return (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
              <div className="relative">
                <span className="text-sm">{avatar}</span>
                <div
                  className={`-bottom-0.5 -right-0.5 absolute h-2.5 w-2.5 rounded-full border border-white dark:border-gray-900 ${
                    status === "online"
                      ? "bg-green-500"
                      : status === "away"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 text-sm dark:text-white">
                  {member.name}
                </p>
                <p className="text-gray-500 text-xs capitalize dark:text-gray-400">
                  {status}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
