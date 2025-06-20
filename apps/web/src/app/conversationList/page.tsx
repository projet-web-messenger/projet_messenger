"use client";

import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";

const conversations = [
  {
    id: 1,
    name: "Alice Martin",
    lastMessage: "Hey! Ready for our meeting?",
    timestamp: "10:24 AM",
    unreadCount: 2,
  },
  {
    id: 2,
    name: "Jean Dupont",
    lastMessage: "J’ai envoyé les fichiers.",
    timestamp: "Yesterday",
    unreadCount: 0,
  },
  {
    id: 3,
    name: "Fatima N'Diaye",
    lastMessage: "On se retrouve où ?",
    timestamp: "Mon",
    unreadCount: 5,
  },
  {
    id: 4,
    name: "Leo Zhang",
    lastMessage: "Parfait, merci !",
    timestamp: "Sun",
    unreadCount: 0,
  },
];

export default function ConversationListPage() {
  return (
    <div className="main flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] px-4 py-10">
      <div className="mx-8 w-6/7 max-w-4xl rounded-3xl bg-white/10 p-8 shadow-xl backdrop-blur-xl">
        <h1 className="mb-6 text-center font-bold text-3xl text-white">Conversations</h1>

        <button
          type="button"
          className="mb-4 ml-auto flex items-center gap-2 rounded-md bg-blue-500/100 px-4 py-2 font-medium text-sm text-white shadow transition hover:bg-blue-600/100"
        >
          <FiPlus size={20} />
          Nouvelle conversation
        </button>

        <div className="flex flex-col gap-4">
          {conversations.map((conv, index) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex items-center justify-between rounded-xl bg-white/10 px-6 py-4 text-white shadow-md transition hover:bg-white/20"
            >
              <div className="flex flex-col">
                <h2 className="font-semibold text-lg">{conv.name}</h2>
                <p className="line-clamp-1 text-blue-100 text-sm">{conv.lastMessage}</p>
              </div>

              <div className="relative flex items-center gap-2 text-blue-200 text-sm">
                <span>{conv.timestamp}</span>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-red-500/100 px-2 py-0.5 font-semibold text-white text-xs shadow">{conv.unreadCount}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
