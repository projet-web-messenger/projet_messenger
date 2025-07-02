import { Badge } from "@repo/ui/data-display/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@repo/ui/data-display/card";
import { Button } from "@repo/ui/form/button";
import { Input } from "@repo/ui/form/input";
import { Avatar } from "@repo/ui/media/avatar";
import { Icon } from "@repo/ui/media/icon";
import { LuEllipsisVertical, LuMessageSquare, LuSearch, LuUserCheck, LuUserPlus, LuUsers } from "react-icons/lu";

// Mock data
const friends = [
  { id: "1", name: "Alice Johnson", status: "online", avatar: "/user1.png", lastSeen: "Now" },
  { id: "2", name: "Bob Smith", status: "away", avatar: "/user2.png", lastSeen: "5 min ago" },
  { id: "3", name: "Carol White", status: "offline", avatar: "/user3.png", lastSeen: "2 hours ago" },
  { id: "4", name: "David Brown", status: "online", avatar: "/user4.png", lastSeen: "Now" },
];

const friendRequests = [
  { id: "1", name: "Eve Wilson", avatar: "/user5.png", mutualFriends: 3 },
  { id: "2", name: "Frank Davis", avatar: "/user6.png", mutualFriends: 1 },
];

export function FriendsArea() {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-gray-200 border-b p-6 dark:border-gray-700">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="flex items-center gap-2 font-bold text-2xl text-gray-900 dark:text-white">
            <Icon as={LuUsers} className="h-6 w-6" />
            Friends
          </h1>
          <Button className="flex items-center gap-2">
            <Icon as={LuUserPlus} className="h-4 w-4" />
            Add Friend
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon as={LuSearch} className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
          <Input placeholder="Search friends..." className="pl-10" />
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon as={LuUserCheck} className="h-5 w-5" />
                Friend Requests
                <Badge variant="subtle" size="sm">
                  {friendRequests.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {friendRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <div className="flex items-center gap-3">
                    <Avatar src={request.avatar} fallback={request.name.slice(0, 2)} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{request.name}</div>
                      <div className="text-gray-500 text-sm dark:text-gray-400">{request.mutualFriends} mutual friends</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Decline
                    </Button>
                    <Button size="sm">Accept</Button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Friends List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon as={LuUsers} className="h-5 w-5" />
              All Friends
              <Badge variant="outline" size="sm">
                {friends.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.id} className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar src={friend.avatar} fallback={friend.name.slice(0, 2)} />
                    <div
                      className={`-bottom-1 -right-1 absolute h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${
                        friend.status === "online" ? "bg-green-500" : friend.status === "away" ? "bg-yellow-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{friend.name}</div>
                    <div className="text-gray-500 text-sm capitalize dark:text-gray-400">
                      {friend.status} • {friend.lastSeen}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Icon as={LuMessageSquare} className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Icon as={LuEllipsisVertical} className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
