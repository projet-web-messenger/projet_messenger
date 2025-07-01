import { Avatar } from "@repo/ui/media/avatar";
import { Icon } from "@repo/ui/media/icon";
import { Highlight } from "@repo/ui/typography/highlight";
import { LuHash, LuPhone } from "react-icons/lu";

// Mock data - replace with real data fetching
const messages = [
  {
    id: "1",
    user: { name: "John Doe", avatar: "/user1.png" },
    content: "Hey everyone! How's everyone doing today?",
    timestamp: "Today at 2:30 PM",
    isOwn: false,
  },
  {
    id: "2",
    user: { name: "You", avatar: "/user-me.png" },
    content: "Good morning! Just finished my coffee ☕",
    timestamp: "Today at 2:32 PM",
    isOwn: true,
  },
  {
    id: "3",
    user: { name: "You", avatar: "/user-me.png" },
    content: "Ready to start working on the project today!",
    timestamp: "Today at 2:32 PM",
    isOwn: true,
  },
  {
    id: "4",
    user: { name: "Alice Smith", avatar: "/user2.png" },
    content: "Same here! Ready to tackle the day 💪",
    timestamp: "Today at 2:33 PM",
    isOwn: false,
  },
  {
    id: "5",
    user: { name: "Alice Smith", avatar: "/user2.png" },
    content: "Let's do this! 🚀",
    timestamp: "Today at 2:33 PM",
    isOwn: false,
  },
  {
    id: "call",
    user: { name: "Verdiane", avatar: "/user3.png" },
    content: "started a call that lasted an hour.",
    timestamp: "4/7/25, 5:18 PM",
    isOwn: false,
    isCallMessage: true,
  },
];

export function MessageList() {
  const group = {
    members: ["John Doe"],
    id: "general",
    name: "General Chat",
  };

  const isGroupChat = group.members.length > 1;
  const groupName = isGroupChat ? group.name : group.members[0];
  const welcomeMessage = isGroupChat
    ? `Welcome to the beginning of the ${groupName} group.`
    : `This is the beginning of your direct messages with ${groupName}.`;

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {/* Welcome Message */}
      <div className="flex select-none flex-col items-start px-4 pt-4 pb-6">
        {isGroupChat ? (
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gray-600 text-white">
            <Icon as={LuHash} size="lg" />
          </div>
        ) : (
          <Avatar size="2xl" className="mb-2" />
        )}
        <h1 className="mb-2 font-bold text-2xl text-gray-900 dark:text-white">{groupName}</h1>
        <p className="text-gray-600 text-sm dark:text-gray-400">
          <Highlight query={groupName} className="font-semibold">
            {welcomeMessage}
          </Highlight>
        </p>
      </div>

      {/* Messages */}
      <div className="pb-4">
        {/* Date Separator for Messages */}
        <div className="flex items-center py-2">
          <hr className="flex-1 border-t" />
          <div className="rounded-lg px-1 text-xs">April 7, 2025</div>
          <hr className="flex-1 border-t" />
        </div>

        <div className="px-4">
          {messages.map((message, index) => {
            const showAvatar = index === 0 || messages[index - 1].user.name !== message.user.name;

            return (
              <div key={message.id} className={`group relative flex gap-4 px-4 py-0.5 hover:bg-gray-800/30 ${showAvatar ? "mt-4" : "mt-0.5"}`}>
                {/* Avatar or spacer */}
                <div className="w-10 flex-shrink-0">
                  {showAvatar ? <Avatar src={message.user.avatar} name={message.user.name} size="sm" className="h-10 w-10" /> : <div className="h-10 w-10" />}
                </div>

                {/* Message content */}
                <div className="min-w-0 flex-1">
                  {showAvatar && (
                    <div className="mb-0.5 flex items-baseline gap-2">
                      <span className="font-medium text-sm">{message.user.name}</span>
                      <span className="text-xs">{message.timestamp}</span>
                    </div>
                  )}

                  {message.isCallMessage ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon as={LuPhone} className="text-green-400" size="sm" />
                      <span className="text-gray-400">{message.content}</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>

                {/* Timestamp on hover for non-avatar messages */}
                {!showAvatar && (
                  <div className="absolute top-0.5 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-xs ">{message.timestamp}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
