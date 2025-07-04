import { createDirectMessage } from "@/actions/conversation";
import { getUserId } from "@/actions/user";
import { Avatar } from "@/components/ui/avatar";
import {
  FriendRequestStatus,
  type FriendsQuery,
  type FriendsQueryVariables,
  type GetFriendsRequestsQuery,
  type GetFriendsRequestsQueryVariables,
  UserStatus,
} from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { GET_FRIENDS, GET_FRIENDS_REQUESTS } from "@/lib/graphql/queries";
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/data-display/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/disclosure/tabs";
import { Button } from "@repo/ui/form/button";
import { Input, InputGroup } from "@repo/ui/form/input";
import { Float } from "@repo/ui/layout/float";
import { Icon } from "@repo/ui/media/icon";
import { LinkBox, LinkOverlay } from "@repo/ui/navigation/link";
import { LuSearch } from "react-icons/lu";
import FriendContentActionButton from "./FriendContentActionButton";
import RequestFriendContentActionButton from "./RequestFriendContentActionButton";

export default async function FriendArea() {
  const userId = await getUserId();
  const {
    data: { friends },
  } = await getClient().query<FriendsQuery, FriendsQueryVariables>({
    query: GET_FRIENDS,
    variables: { userId },
  });

  const {
    data: { friendRequests },
  } = await getClient().query<
    GetFriendsRequestsQuery,
    GetFriendsRequestsQueryVariables
  >({
    query: GET_FRIENDS_REQUESTS,
    variables: { userId },
  });

  const onlineFriends = friends.filter(
    (friend) => friend.status === UserStatus.Online
  );
  const pendingFriendRequests = friendRequests.filter(
    (friendRequest) => friendRequest.status === FriendRequestStatus.Pending
  );

  const defaultValue = onlineFriends.length > 0 ? "online" : "all";

  return (
    <Tabs
      defaultValue={defaultValue}
      className="min-w-0 space-y-4">
      <TabsList
        as="header"
        className="flex h-12 items-center gap-4 border-b px-4 py-2">
        <Button
          as="div"
          className="h-8 cursor-default rounded-lg px-2"
          size="md"
          variant="plain">
          <Icon asChild>
            <svg className="size-6">
              <use href="/static/assets/icons/user-friend.svg" />
            </svg>
          </Icon>
          <span>Friends</span>
        </Button>
        {onlineFriends.length > 0 ? (
          <TabsTrigger
            value="online"
            asChild>
            <Button
              as="div"
              className="h-8 rounded-lg px-2 text-md"
              size="md"
              variant="ghost">
              Online
            </Button>
          </TabsTrigger>
        ) : null}
        <TabsTrigger
          value="all"
          asChild>
          <Button
            as="div"
            className="h-8 rounded-lg px-2 text-md"
            size="md"
            variant="ghost">
            All
          </Button>
        </TabsTrigger>
        {friendRequests.length > 0 ? (
          <TabsTrigger
            value="pending"
            asChild>
            <Button
              as="div"
              className="h-8 rounded-lg px-2 text-md"
              size="md"
              variant="ghost">
              Pending
            </Button>
          </TabsTrigger>
        ) : null}
        <TabsTrigger
          value="add-friend"
          asChild>
          <Button
            as="div"
            className="h-8 rounded-lg px-2"
            size="md"
            variant="solid">
            Add Friend
          </Button>
        </TabsTrigger>
      </TabsList>

      {onlineFriends.length > 0 ? (
        <TabsContent
          value="online"
          className="px-4">
          <InputGroup
            endElement={<Icon as={LuSearch} />}
            className="w-full">
            <Input
              placeholder="Search"
              variant="subtle"
              className="rounded-lg"
              size="sm"
            />
          </InputGroup>
          <p className="mt-5 mb-4">Online - {friends.length}</p>
          <FriendContent friends={onlineFriends} />
        </TabsContent>
      ) : null}

      <TabsContent
        value="all"
        className="px-4">
        <p className="mt-5 mb-4">Online - {friends.length}</p>
        <FriendContent friends={friends} />
      </TabsContent>

      {friendRequests.length > 0 ? (
        <TabsContent
          value="pending"
          className="px-4">
          <p className="mt-5 mb-4">Pending - {friendRequests.length}</p>
          <RequestFriendContent pendingFriendRequests={pendingFriendRequests} />
        </TabsContent>
      ) : null}

      <TabsContent
        value="add-friend"
        className="px-4">
        <AddFriendContent />
      </TabsContent>
    </Tabs>
  );
}

function FriendContent({ friends }: { friends: FriendsQuery["friends"] }) {
  const handleCreateDirectMessage = async (formData: FormData) => {
    "use server";
    const friendId = formData.get("friendId") as string;
    await createDirectMessage(friendId);
  };

  return (
    <>
      <ul>
        {friends.map((friend) => {
          return (
            <li
              key={friend.id}
              className="border-t py-2">
              <form action={handleCreateDirectMessage}>
                <input
                  type="hidden"
                  name="friendId"
                  value={friend.id}
                />
                <Button
                  variant="ghost"
                  asChild>
                  <Card
                    className="h-auto flex-none flex-row items-start justify-start rounded-lg border-0"
                    asChild>
                    <LinkBox>
                      <CardHeader className="relative justify-center p-2">
                        <Avatar
                          src={friend.avatar ?? undefined}
                          name={friend.displayName ?? undefined}
                          size="md"
                        />
                        <Float
                          placement="bottom-end"
                          className="right-3.5 bottom-3.5">
                          <div className="size-3.5 rounded-full border-2 bg-green-500" />
                        </Float>
                      </CardHeader>
                      <CardBody className="h-full justify-center p-2">
                        <CardTitle className="font-medium text-sm">
                          <LinkOverlay
                            as="button"
                            type="submit">
                            {friend.displayName}
                          </LinkOverlay>
                        </CardTitle>
                        <CardDescription className="line-clamp-1 text-ellipsis text-gray-500 text-xs">
                          {friend.status}
                        </CardDescription>
                      </CardBody>
                      <CardFooter className="h-full items-center justify-between p-2">
                        <FriendContentActionButton friendId={friend.id} />
                      </CardFooter>
                    </LinkBox>
                  </Card>
                </Button>
              </form>
            </li>
          );
        })}
      </ul>
    </>
  );
}

type RequestFriendContentProps = {
  pendingFriendRequests: GetFriendsRequestsQuery["friendRequests"];
};
function RequestFriendContent({
  pendingFriendRequests,
}: RequestFriendContentProps) {
  return (
    <ul>
      {pendingFriendRequests.map((friendRequest) => {
        const { id, sender } = friendRequest;

        return (
          <li
            key={sender.id}
            className="border-t py-2">
            <Button
              variant="ghost"
              asChild>
              <Card className="h-auto flex-none flex-row items-start justify-start rounded-lg border-0">
                <CardHeader className="relative justify-center p-2">
                  <Avatar
                    src={sender.avatar ?? undefined}
                    name={sender.displayName ?? undefined}
                    size="md"
                  />
                </CardHeader>
                <CardBody className="h-full justify-center p-2">
                  <CardTitle className="font-medium text-sm">
                    {sender.displayName}
                  </CardTitle>
                  <CardDescription className="line-clamp-1 text-ellipsis text-gray-500 text-xs capitalize">
                    Incoming friend request
                  </CardDescription>
                </CardBody>
                <CardFooter className="h-full items-center justify-end gap-2 p-2">
                  <RequestFriendContentActionButton requestId={id} />
                </CardFooter>
              </Card>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function AddFriendContent() {
  return (
    <Card className="border-0">
      <CardHeader>
        <CardTitle className="font-semibold text-lg">Add Friend</CardTitle>
        <CardDescription className="text-gray-500 text-sm">
          You can add friends with their Discord username.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <div className="w- relative isolate flex flex items-center rounded-lg bg-[var(--color-subtle)] px-3 py-1 outline-[var(--color-focus-ring)] focus-within:outline-2 focus-within:outline-solid">
          <Input
            placeholder="Enter username"
            variant="plain"
            className="h-16 rounded-lg [outline:0]!"
            size="lg"
          />
          <Button
            as="div"
            className="rounded-lg"
            size="md"
            variant="solid">
            Send Friend Request
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
