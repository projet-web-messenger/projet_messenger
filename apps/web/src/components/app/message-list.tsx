import { Avatar } from "@repo/ui/media/avatar";
import { Icon } from "@repo/ui/media/icon";
import { Highlight } from "@repo/ui/typography/highlight";
import { LuHash } from "react-icons/lu";

// Custom date formatting functions
function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatMessageDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

  if (isToday) {
    return `Today at ${formatMessageTime(timestamp)}`;
  }
  if (isYesterday) {
    return `Yesterday at ${formatMessageTime(timestamp)}`;
  }
  const dateStr = date.toLocaleDateString([], {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
  return `${dateStr}, ${formatMessageTime(timestamp)}`;
}

function formatDateSeparator(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

  if (isToday) {
    return "Today";
  }
  if (isYesterday) {
    return "Yesterday";
  }
  return date.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Mock data with real timestamps
const messages = [
  {
    id: "1",
    user: { name: "John Doe", avatar: "/user1.png" },
    content: "Hey everyone! How's everyone doing today?",
    timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    isOwn: false,
  },
  {
    id: "2",
    user: { name: "You", avatar: "/user-me.png" },
    content: "Good morning! Just finished my coffee ☕",
    timestamp: Date.now() - 1.5 * 60 * 60 * 1000, // 1.5 hours ago
    isOwn: true,
  },
  {
    id: "3",
    user: { name: "You", avatar: "/user-me.png" },
    content: "Ready to start working on the project today!",
    timestamp: Date.now() - 1.4 * 60 * 60 * 1000, // 1.4 hours ago
    isOwn: true,
  },
  {
    id: "4",
    user: { name: "Alice Smith", avatar: "/user2.png" },
    content: "Same here! Ready to tackle the day 💪",
    timestamp: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    isOwn: false,
  },
  {
    id: "5",
    user: { name: "Alice Smith", avatar: "/user2.png" },
    content: "Let's do this! 🚀",
    timestamp: Date.now() - 55 * 60 * 1000, // 55 minutes ago
    isOwn: false,
  },
  {
    id: "6",
    user: { name: "Bob Wilson", avatar: "/user4.png" },
    content: "Great to see everyone motivated! Let's have a productive day 🎯",
    timestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    isOwn: false,
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

  // Get the most recent message timestamp for date separator
  const mostRecentTimestamp = messages.length > 0 ? Math.max(...messages.map((m) => m.timestamp)) : Date.now();

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
          <div className="rounded-lg px-1 text-xs">{formatDateSeparator(mostRecentTimestamp)}</div>
          <hr className="flex-1 border-t" />
        </div>

        <div className="px-4">
          {messages.map((message, index) => {
            const showAvatar = index === 0 || messages[index - 1].user.name !== message.user.name;

            return (
              <div key={message.id} className={`group relative flex gap-4 px-4 py-0.5 hover:bg-gray-800/30 ${showAvatar ? "mt-4" : "mt-0.5"}`}>
                {/* Avatar or spacer */}
                <div className="w-12 flex-shrink-0">
                  {showAvatar ? (
                    <Avatar src={message.user.avatar} name={message.user.name} size="sm" className="h-12 w-12" />
                  ) : (
                    <div className="h-12 w-12 leading-4 opacity-100 transition-opacity group-hover:opacity-100">
                      <span className="text-gray-500 text-xs">{formatMessageTime(message.timestamp)}</span>
                    </div>
                  )}
                </div>

                {/* Message content */}
                <div className="min-w-0 flex-1">
                  {showAvatar && (
                    <div className="mb-0.5 flex items-baseline gap-2">
                      <span className="font-medium text-sm">{message.user.name}</span>
                      <span className="text-gray-500 text-xs">{formatMessageDateTime(message.timestamp)}</span>
                    </div>
                  )}

                  <p className="flex-shrink-0 text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
