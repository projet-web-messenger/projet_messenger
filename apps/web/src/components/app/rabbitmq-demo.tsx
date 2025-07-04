"use client";

import { MESSAGE_RECEIVED } from "@/graphql/subscriptions";
import { useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";

// ✅ Types
interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  sender: {
    id: number;
    name: string;
    email: string;
  };
  conversationId: number;
}

export default function RabbitmqDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>("🔌 Connecting...");
  const [messageCount, setMessageCount] = useState(0);

  // ✅ Subscription pour recevoir TOUS les messages du système
  const { data, loading, error } = useSubscription(MESSAGE_RECEIVED, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.messageReceived) {
        const newMessage = subscriptionData.data.messageReceived;

        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.log("🐰 RabbitMQ → GraphQL → Frontend:", newMessage);

        // Ajouter le message à notre liste (garder seulement les 10 derniers)
        setMessages((prev) => {
          const updated = [newMessage, ...prev].slice(0, 10);
          return updated;
        });

        setMessageCount((prev) => prev + 1);

        // Mettre à jour le statut de connexion
        setConnectionStatus("🟢 Connected & Receiving");
      }
    },
    onError: (error) => {
      console.error("❌ Erreur subscription RabbitMQ:", error);
      setConnectionStatus("🔴 Connection Error");
    },
  });

  // ✅ Effet pour gérer le statut de connexion
  useEffect(() => {
    if (loading) {
      setConnectionStatus("🔌 Connecting...");
    } else if (error) {
      setConnectionStatus("🔴 Connection Error");
    } else {
      setConnectionStatus("🟢 Connected");
    }
  }, [loading, error]);

  const clearMessages = () => {
    setMessages([]);
    setMessageCount(0);
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "Invalid time";
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-100 p-4 shadow-sm dark:border-gray-600 dark:bg-gray-800">
      {/* Header avec statut */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm dark:text-white">🐰 Real-time Messages</h3>
          <span className="rounded-full bg-gray-200 px-2 py-1 text-gray-600 text-xs dark:bg-gray-700 dark:text-gray-300">
            {messageCount} msg{messageCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`${
              connectionStatus.includes("🟢")
                ? "text-green-600 dark:text-green-400"
                : connectionStatus.includes("🔴")
                  ? "text-red-600 dark:text-red-400"
                  : "text-yellow-600 dark:text-yellow-400"
            }`}
          >
            {connectionStatus}
          </span>
        </div>

        <p className="mt-1 text-gray-500 text-xs dark:text-gray-400">Via RabbitMQ → WebSocket</p>
      </div>

      {/* Messages en temps réel */}
      <div className="mb-4 max-h-48 space-y-2 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="py-4 text-center">
            <div className="text-gray-400 text-xs dark:text-gray-500">🎯 En attente...</div>
            <div className="mt-1 text-gray-300 text-xs dark:text-gray-600">Envoyez un message !</div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.id}-${index}`}
              className="animate-pulse rounded border-blue-500 border-l-2 bg-white p-2 text-xs dark:border-blue-400 dark:bg-gray-700"
              style={{
                animationDuration: "2s",
                animationIterationCount: "1",
              }}
            >
              <div className="mb-1 flex items-start justify-between">
                <span className="font-medium text-gray-900 text-xs dark:text-white">{message.sender?.name || `User ${message.senderId}`}</span>
                <div className="flex gap-1 text-gray-400 text-xs dark:text-gray-500">
                  <span>#{message.conversationId}</span>
                  <span>•</span>
                  <span>{formatTime(message.createdAt)}</span>
                </div>
              </div>
              <p className="text-gray-700 text-xs leading-relaxed dark:text-gray-300">{message.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-gray-200 border-t pt-2 dark:border-gray-600">
        <button
          type="button"
          onClick={clearMessages}
          disabled={messages.length === 0}
          className="px-2 py-1 text-gray-500 text-xs hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200"
        >
          🗑️ Vider
        </button>

        <div className="text-gray-400 text-xs dark:text-gray-500">
          {loading && "⏳ Loading..."}
          {error && "❌ Error"}
        </div>
      </div>

      {/* Indicateur visuel */}
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full transition-all duration-500 ${
            connectionStatus.includes("🟢")
              ? "bg-green-500 dark:bg-green-400"
              : connectionStatus.includes("🔴")
                ? "bg-red-500 dark:bg-red-400"
                : "bg-yellow-500 dark:bg-yellow-400"
          }`}
          style={{ width: connectionStatus.includes("🟢") ? "100%" : "50%" }}
        />
      </div>
    </div>
  );
}
