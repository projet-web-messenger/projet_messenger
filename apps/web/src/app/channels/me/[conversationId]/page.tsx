import { getUserId } from "@/actions/user";
import { MessageFooter } from "@/components/app/message-footer";
import MessageHeader from "@/components/app/message-header";
import MessageList from "@/components/app/message-list";
import { type ConversationQuery, type ConversationQueryVariables, ConversationType } from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { GET_CONVERSATION } from "@/lib/graphql/queries";
import { Card, CardBody, CardFooter, CardHeader } from "@repo/ui/data-display/card";
import { IconButton } from "@repo/ui/form/button";
import { Icon } from "@repo/ui/media/icon";
import { LuPlus, LuSmile } from "react-icons/lu";

type MessageAreaProps = {
  params: Promise<{ conversationId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function MessageArea(props: MessageAreaProps) {
  const conversationId = (await props.params).conversationId;
  const searchParams = await props.searchParams;

  const userId = await getUserId();

  const {
    data: { conversation },
  } = await getClient().query<ConversationQuery, ConversationQueryVariables>({
    query: GET_CONVERSATION,
    variables: {
      conversationId,
    },
  });

  const conversationAvatar =
    conversation?.type === ConversationType.DirectMessage
      ? conversation.users.find((useConversation) => useConversation.user.id !== userId)?.user.avatar
      : conversation?.avatar;

  const conversationDisplayName =
    conversation?.type === ConversationType.DirectMessage
      ? conversation.users.find((useConversation) => useConversation.user.id !== userId)?.user.displayName
      : conversation?.users
          .map((useConversation, index) => {
            if (index === 3) {
              return `+${conversation.users.length - 2}`;
            }
            if (index > 2) {
              return null;
            }
            return useConversation.user.id !== userId ? useConversation.user.displayName : "";
          })
          .filter(Boolean)
          .join(", ") || conversation?.name;

  return (
    <Card className="flex h-dvh flex-col border-0">
      <CardHeader className="flex h-12 flex-row items-center border-b px-4 py-2">
        <MessageHeader conversationAvatar={conversationAvatar} conversationDisplayName={conversationDisplayName} conversationName={conversation?.name} />
      </CardHeader>
      <CardBody className="overflow-y-auto p-2">
        <MessageList
          conversationAvatar={conversationAvatar}
          conversationDisplayName={conversationDisplayName as string}
          conversationName={conversation?.name}
          conversationId={conversationId}
          searchParams={searchParams}
        />
        {/* Auto-scroll anchor */}
        <div id="messages-area" />
      </CardBody>
      <CardFooter className="px-4 py-6">
        <div className="relative isolate flex min-h-14 w-full rounded-lg bg-[var(--color-subtle)] px-3 py-1 outline-[var(--color-focus-ring)] focus-within:outline-2 focus-within:outline-solid">
          <div className="pt-2">
            <IconButton icon={<LuPlus />} variant="unstyled" className="opacity-60 hover:opacity-100" />
          </div>
          <MessageFooter conversationId={conversationId} />
          <div className="pt-2">
            <Icon as={LuSmile} />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
