import { ChannelHeader } from "./channel-header";
import { ChannelList } from "./channel-list";
import { MembersList } from "./members-list";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";

export function MessageArea() {
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
