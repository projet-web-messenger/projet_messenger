"use client";

import { Avatar } from "@repo/ui/media/avatar";
import { useEffect, useRef } from "react";
import { useMessages } from "../../../hooks/useMessages";

interface MessageListProps {
  conversationId?: number;
  user1Id?: number;
  user2Id?: number;
}

export function MessageList({ conversationId, user1Id, user2Id }: MessageListProps) {
  const { messages, loading, error } = useMessages(conversationId, user1Id, user2Id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AutoScroll vers le bas qd de nvx msgs arrivent
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Chargement des messages...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-red-500">Erreur lors du chargement des messages: {error.message}</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Aucun message. Commencez la conversation !</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((message) => (
        <div key={message.id} className="group -mx-4 flex gap-3 rounded px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50">
          <Avatar src={`/avatars/${message.sender.name.toLowerCase()}.png`} fallback={message.sender.name.slice(0, 2)} size="sm" className="mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-semibold text-gray-900 text-sm dark:text-white">{message.sender.name}</span>
              <span className="text-gray-500 text-xs dark:text-gray-400">{new Date(message.createdAt).toLocaleTimeString()}</span>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed dark:text-gray-200">{message.content}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} className="h-0" />
    </div>
  );
}
