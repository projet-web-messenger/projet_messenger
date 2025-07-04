import { ChannelHeader } from "@/components/app/channel-header";
import { MembersList } from "@/components/app/members-list";
import { MessageInput } from "@/components/app/message-input";
import { MessageList } from "@/components/app/message-list";
import RabbitmqDemo from "@/components/app/rabbitmq-demo";

type Params = Promise<{ id: string }>;

type MessageAreaProps = {
  params: Params;
};

export default async function MessageArea({ params }: MessageAreaProps) {
  const { id } = await params;
  const conversationId = Number.parseInt(decodeURIComponent(id));
  const currentUserId = 1;

  return (
    <div className="flex h-full">
      {/* Message Area - Zone principale ÉLARGIE */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ChannelHeader />
        <div className="flex min-h-0 flex-1 flex-col">
          <MessageList conversationId={conversationId} />
          <MessageInput conversationId={conversationId} currentUserId={currentUserId} />
        </div>
      </div>

      {/* ✅ Panneau latéral COMPACT - 300px fixe */}
      <div className="flex w-[300px] flex-shrink-0 flex-col border-gray-200 border-l bg-white dark:border-gray-700 dark:bg-gray-900">
        {/* ✅ RabbitMQ Monitor */}
        <div className="border-gray-200 border-b p-3 dark:border-gray-700">
          <h2 className="mb-2 font-semibold text-gray-900 text-sm dark:text-white">🐰 RabbitMQ Monitor</h2>
          <RabbitmqDemo />
        </div>

        {/* ✅ Members List */}
        <div className="flex-1 overflow-hidden p-3">
          <h3 className="mb-2 font-semibold text-gray-900 text-sm dark:text-white">👥 Membres</h3>
          <div className="max-h-full overflow-y-auto">
            <MembersList conversationId={conversationId} />
          </div>
        </div>
      </div>
    </div>
  );
}
