import { getUserId } from "@/actions/user";
import { ConversationType, type UserConversationsQuery, type UserConversationsQueryVariables, UserStatus } from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { GET_USER_CONVERSATIONS } from "@/lib/graphql/queries";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/data-display/card";
import { Button, CloseButton } from "@repo/ui/form/button";
import { Float } from "@repo/ui/layout/float";
import { LinkBox, LinkOverlay } from "@repo/ui/navigation/link";
import { cn } from "@repo/utils/classes";
import { Avatar } from "../ui/avatar";
import { Link } from "../ui/link";

export default async function ChannelList() {
  const userId = await getUserId();

  const {
    data: { userConversations },
  } = await getClient().query<UserConversationsQuery, UserConversationsQueryVariables>({
    query: GET_USER_CONVERSATIONS,
    variables: { userId },
  });

  return (
    <ul className="relative isolate flex min-h-10 flex-col p-2">
      {userConversations.map(({ conversation }) => {
        const isGroupChat = conversation.type === ConversationType.GroupChat;

        const conversationAvatar = !isGroupChat
          ? conversation.users.find((useConversation) => useConversation.user.id !== userId)?.user.avatar
          : conversation?.avatar;

        const conversationDisplayName = !isGroupChat
          ? conversation.users.find((useConversation) => useConversation.user.id !== userId)?.user.displayName
          : conversation?.users
              .map((useConversation) => (useConversation.user.id === userId ? useConversation.user.displayName : ""))
              .filter(Boolean)
              .join(", ") || conversation?.name;

        return (
          <li key={conversation.id} className="w-full">
            <Button variant="ghost" asChild>
              <Card className="h-auto flex-none flex-row items-center justify-start rounded-lg border-0" asChild>
                <LinkBox>
                  <CardHeader className="relative justify-center p-2">
                    <Avatar src={conversationAvatar ?? undefined} name={conversation.name ?? undefined} size="md" />
                    {!isGroupChat ? (
                      <Float placement="bottom-end" className="right-3 bottom-3">
                        <div
                          className={cn(
                            "size-3.5 rounded-full border-2",
                            conversation.users.find((useConversation) => useConversation.user.id !== userId)?.user.status === UserStatus.Online
                              ? " bg-green-500"
                              : " bg-gray-300",
                          )}
                        />
                      </Float>
                    ) : null}
                  </CardHeader>
                  <CardBody className="h-full justify-center p-2">
                    {/* Message Info */}
                    <CardTitle className="font-semibold text-md">
                      <LinkOverlay className="hover:no-underline" asChild>
                        <Link href={`/channels/me/${conversation.id}`}>{conversationDisplayName}</Link>
                      </LinkOverlay>
                    </CardTitle>
                    <CardDescription className="line-clamp-1 text-ellipsis text-gray-500 text-xs">
                      {isGroupChat ? conversation.description : conversation.users.find((useConversation) => useConversation.user.id !== userId)?.user.bio}
                    </CardDescription>
                  </CardBody>
                  <CardFooter className="h-full items-center justify-between p-2">
                    <CloseButton variant="unstyled" size="sm" className="p-0.5 opacity-50 transition-all hover:scale-105 hover:opacity-100" />
                  </CardFooter>
                </LinkBox>
              </Card>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
