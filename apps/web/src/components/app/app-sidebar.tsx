import { Button } from "@repo/ui/form/button";
import { Avatar } from "@repo/ui/media/avatar";
import { Icon } from "@repo/ui/media/icon";
import { LuChevronDown, LuHash, LuPlus, LuUsers } from "react-icons/lu";

// Mock data - replace with real data fetching
const servers = [
  { id: "1", name: "My Server", avatar: "/server1.png", online: 42 },
  { id: "2", name: "Gaming Hub", avatar: "/server2.png", online: 128 },
  { id: "3", name: "Study Group", avatar: "/server3.png", online: 8 },
];

const channels = [
  { id: "1", name: "general", type: "text", unread: 0 },
  { id: "2", name: "random", type: "text", unread: 3 },
  { id: "3", name: "announcements", type: "text", unread: 1 },
  { id: "4", name: "General Voice", type: "voice", users: 4 },
];

export function AppSidebar() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden p-3">
      {/* Server Header */}
      <div className="mb-4">
        <Button
          variant="ghost"
          className="h-auto w-full justify-between rounded-lg border border-gray-200 bg-white p-3 text-left hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Avatar src="/server1.png" fallback="MS" size="sm" />
            <span className="truncate font-semibold text-gray-900 dark:text-white">My Server</span>
          </div>
          <Icon as={LuChevronDown} className="h-4 w-4 text-gray-500" />
        </Button>
      </div>

      {/* Channels Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between px-2 py-1">
            <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Text Channels</h3>
            <Button size="sm" variant="ghost" className="h-4 w-4 p-0">
              <Icon as={LuPlus} className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-0.5">
            {channels
              .filter((channel) => channel.type === "text")
              .map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className="h-8 w-full justify-start p-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <Icon as={LuHash} className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="truncate">{channel.name}</span>
                  {channel.unread && channel.unread > 0 && (
                    <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-white text-xs">
                      {channel.unread}
                    </span>
                  )}
                </Button>
              ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between px-2 py-1">
            <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Voice Channels</h3>
            <Button size="sm" variant="ghost" className="h-4 w-4 p-0">
              <Icon as={LuPlus} className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-0.5">
            {channels
              .filter((channel) => channel.type === "voice")
              .map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className="h-8 w-full justify-start p-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <Icon as={LuUsers} className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="truncate">{channel.name}</span>
                  {channel.users && <span className="ml-auto text-gray-500 text-xs">{channel.users}</span>}
                </Button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
