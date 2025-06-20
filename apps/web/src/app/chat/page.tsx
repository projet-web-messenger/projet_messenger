"use client";

import { useParams } from "next/navigation";

const messages = [
  { id: 1, from: "other", text: "Salut !" },
  { id: 2, from: "me", text: "Hello !" },
  { id: 3, from: "me", text: "Tu es dispo pour le call ?" },
  { id: 4, from: "other", text: "Oui bien sûr, j’arrive." },
  { id: 5, from: "other", text: "Top, ramène moi du sandwich stp !" },
  { id: 6, from: "me", text: "Merci bro !" },
  { id: 7, from: "me", text: "Avec plaisir, tu veux quoi comme boisson ?" },
  { id: 8, from: "other", text: "Oasis" },
];

export default function ChatPage() {
  const params = useParams();
  const conversationId = params?.id;

  return (
    <div className="flex h-screen w-screen flex-col bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] p-6 text-white">
      <header className="mb-4 font-bold text-xl">Conversation #{conversationId}</header>

      {/* Messages */}
      <div className="scrollbar-blue flex-1 space-y-4 overflow-y-auto rounded-xl bg-white/10 p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.from === "me" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-xs rounded-2xl px-4 py-2 text-sm shadow-md ${
                msg.from === "me" ? "bg-gradient-to-br from-sky-500 to-blue-400 text-white" : "bg-gradient-to-br from-pink-500 to-purple-500 text-white"
              }`}
            >
              {msg.text}
            </div>
            <span className="mt-1 text-blue-200 text-xs">10:24 AM</span>
          </div>
        ))}
      </div>

      {/* Input */}
      <form className="mt-4 flex">
        <input
          type="text"
          placeholder="Écris un message..."
          className="flex-1 rounded-l-md bg-white/10 px-4 py-2 text-white placeholder:text-blue-200 focus:outline-none"
        />
        <button type="submit" className="rounded-r-md bg-blue-500 px-4 py-2 font-semibold hover:bg-blue-600">
          Envoyer
        </button>
      </form>
    </div>
  );
}
