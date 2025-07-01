import { Badge } from "@repo/ui/data-display/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@repo/ui/data-display/card";
import { Button } from "@repo/ui/form/button";
import { Avatar } from "@repo/ui/media/avatar";
import { Icon } from "@repo/ui/media/icon";
import { LuPlus, LuServer, LuSettings, LuTrendingUp, LuUsers } from "react-icons/lu";

// Mock data
const servers = [
  {
    id: "1",
    name: "Gaming Hub",
    avatar: "/server1.png",
    members: 1247,
    online: 342,
    description: "The best place for gamers to connect and play together",
  },
  {
    id: "2",
    name: "Study Group",
    avatar: "/server2.png",
    members: 56,
    online: 12,
    description: "Collaborative learning and study sessions",
  },
  {
    id: "3",
    name: "Tech Talk",
    avatar: "/server3.png",
    members: 892,
    online: 156,
    description: "Discuss the latest in technology and programming",
  },
];

export function ServerArea() {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-gray-200 border-b p-6 dark:border-gray-700">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="flex items-center gap-2 font-bold text-2xl text-gray-900 dark:text-white">
            <Icon as={LuServer} className="h-6 w-6" />
            Servers
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Icon as={LuPlus} className="h-4 w-4" />
              Join Server
            </Button>
            <Button className="flex items-center gap-2">
              <Icon as={LuPlus} className="h-4 w-4" />
              Create Server
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <Card key={server.id} className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar src={server.avatar} fallback={server.name.slice(0, 2)} size="lg" className="rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-lg">{server.name}</CardTitle>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-gray-600 text-sm dark:text-gray-400">{server.online} online</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon as={LuUsers} className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600 text-sm dark:text-gray-400">{server.members} members</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <p className="mb-4 line-clamp-2 text-gray-600 text-sm dark:text-gray-400">{server.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" size="sm" className="flex items-center gap-1">
                    <Icon as={LuTrendingUp} className="h-3 w-3" />
                    Active
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Icon as={LuSettings} className="h-4 w-4" />
                    </Button>
                    <Button size="sm">Join</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
