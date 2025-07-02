import { ChannelHeader } from "@/components/app/channel-header";
import { MembersList } from "@/components/app/members-list";
import { MessageInput } from "@/components/app/message-input";
import { MessageList } from "@/components/app/message-list";

type Params = Promise<{ id: string }>;

type MessageAreaProps = {
  params: Params;
};
export default async function MessageArea({ params }: MessageAreaProps) {
  const { id } = await params;
  const channelId = decodeURIComponent(id);

  return (
    <div className="flex h-full">
      {/* Message Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ChannelHeader />
        <div className="flex min-h-0 flex-1 flex-col">
          <MessageList />
          <MessageInput />
        </div>
      </div>

      {/* Members List */}
      <div className="hidden w-60 border-gray-200 border-l bg-gray-50 xl:block dark:border-gray-700 dark:bg-gray-850">
        <MembersList />
      </div>
    </div>
  );
}
