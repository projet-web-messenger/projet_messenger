import { Avatar } from "@repo/ui/media/avatar";

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
    user: { name: "Alice Smith", avatar: "/user2.png" },
    content: "Same here! Ready to tackle the day 💪",
    timestamp: "Today at 2:33 PM",
    isOwn: false,
  },
];

export function MessageList() {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((message) => (
        <div key={message.id} className="group -mx-4 flex gap-3 rounded px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50">
          <Avatar src={message.user.avatar} fallback={message.user.name.slice(0, 2)} size="sm" className="mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-semibold text-gray-900 text-sm dark:text-white">{message.user.name}</span>
              <span className="text-gray-500 text-xs dark:text-gray-400">{message.timestamp}</span>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed dark:text-gray-200">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
