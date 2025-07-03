import { ChannelHeader } from "./channel-header";
import { ChannelList } from "./channel-list";
import { MembersList } from "./members-list";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import RabbitmqDemo from "./rabbitmq-demo";

interface MessageAreaProps {
  conversationId?: number;
  user1Id?: number;
  user2Id?: number;
  currentUserId?: number; // ID de l'utilisateur actuel
  params: { id: string }; // Ajout de la propriété 'params'
}

export async function MessageArea({ params }: MessageAreaProps) {
  const { id } = await params;
  const conversationId = Number.parseInt(decodeURIComponent(id));
  const currentUserId = 1; // Remplacer par l'ID de l'utilisateur actuel

  return (
    <div className="flex h-full">
      {/* Channel List */}
      <div className="hidden w-60 border-gray-200 border-r bg-gray-50 lg:block dark:border-gray-700 dark:bg-gray-850">
        <ChannelList />
      </div>

      {/* Message Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ChannelHeader />
        <div className="flex min-h-0 flex-1 flex-col">
          <MessageList conversationId={conversationId} />
          <MessageInput conversationId={conversationId} currentUserId={currentUserId} />
        </div>
      </div>

      {/* Members List avec RabbitMQ Demo */}
      <div className="hidden w-60 border-gray-200 border-l bg-gray-50 xl:block dark:border-gray-700 dark:bg-gray-850">
        {/* Monotoring RabbitMQ */}
        <div className="p-4">
          <h2 className="mb-4 font-semibold text-lg">RabbitMQ Demo</h2>

          <RabbitmqDemo />
        </div>
        <div className="border-gray-200 border-t dark:border-gray-700">
          <MembersList />
        </div>
      </div>
    </div>
  );
}
