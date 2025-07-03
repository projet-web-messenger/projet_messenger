"use client";

import { Button, IconButton } from "@repo/ui/form/button";
import { Input, InputGroup } from "@repo/ui/form/input";
import { Icon } from "@repo/ui/media/icon";
import { useState } from "react";
import { LuPlus, LuSmile } from "react-icons/lu";
import { useMessages } from "../../../hooks/useMessages";

interface MessageInputProps {
  conversationId?: number;
  user1Id?: number;
  user2Id?: number;
  currentUserId: number; // ID de l'utilisateur actuel
}

export function MessageInput({ conversationId, user1Id, user2Id, currentUserId }: MessageInputProps) {
  // State pour gérer le contenu du message
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage, sendLoading, refetch } = useMessages(conversationId, user1Id, user2Id);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // ✅ Vérification que le message n'est pas vide
    if (!message.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await sendMessage(message.trim(), currentUserId);
      setMessage(""); // Réinitialiser le champ de saisie après l'envoi

      // ✅ AJOUTÉ - Actualiser les messages après envoi
      setTimeout(() => {
        refetch();
      }, 100); // Petit délai pour laisser le backend traiter
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  // ✅ Bouton désactivé si message vide, en cours d'envoi, ou pas d'userId
  const isButtonDisabled = !message.trim() || isLoading || sendLoading || !currentUserId;

  return (
    <div className="border-gray-200 border-t bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="p-4">
        <InputGroup
          startElement={<IconButton icon={<LuPlus />} variant="unstyled" className="opacity-60 hover:opacity-100" />}
          endElement={<Icon as={LuSmile} />}
          className="w-full"
        >
          <Input
            as="textarea"
            placeholder="Message @John Doe"
            variant="subtle"
            className="h-[3.25rem] resize-none py-4"
            size="md"
            rows={1}
            onKeyDown={handleKeyDown}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </InputGroup>
        <Button
          type="submit"
          disabled={isButtonDisabled}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Envoi..." : "Envoyer"}
        </Button>
      </form>
    </div>
  );
}
