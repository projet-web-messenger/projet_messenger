import { getUserId } from "@/actions/user";
import {
  ConversationType,
  type ConversationWithMessagesQuery,
  type ConversationWithMessagesQueryVariables,
} from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { GET_CONVERSATION_WITH_MESSAGES } from "@/lib/graphql/queries";
import { Card, CardBody } from "@repo/ui/data-display/card";
import { IconButton } from "@repo/ui/form/button";
import { Icon } from "@repo/ui/media/icon";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@repo/ui/overlay/menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/overlay/tooltip";
import { Highlight } from "@repo/ui/typography/highlight";
import { cn } from "@repo/utils/classes";
import { LuEllipsis, LuHash, LuPencil, LuTrash } from "react-icons/lu";
import { Avatar } from "../ui/avatar";
import { Link } from "../ui/link";
import MessageDelete from "./message-delete";
import MessageEditing from "./message-editing";

// Custom date formatting functions
function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatMessageDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() ===
    date.toDateString();

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

function formatDateSeparator(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() ===
    date.toDateString();

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

type MessageListProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
  conversationId: string;
  conversationAvatar?: string | null;
  conversationName?: string | null;
  conversationDisplayName: string;
};

export default async function MessageList({
  searchParams,
  conversationId,
  conversationAvatar,
  conversationDisplayName,
  conversationName,
}: MessageListProps) {
  const userId = await getUserId();

  const {
    data: { conversation },
  } = await getClient().query<
    ConversationWithMessagesQuery,
    ConversationWithMessagesQueryVariables
  >({
    query: GET_CONVERSATION_WITH_MESSAGES,
    variables: {
      conversationId,
    },
  });

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 text-xl dark:text-white">
            Conversation not found
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This conversation may have been deleted or you don't have access to
            it.
          </p>
        </div>
      </div>
    );
  }

  const isGroupChat = conversation.type === ConversationType.GroupChat;
  const welcomeMessage = isGroupChat
    ? `Welcome to the beginning of the ${conversationDisplayName} ${conversation.users.length > 3 ? `+${conversation.users.length - 3}` : ""} group.`
    : `This is the beginning of your direct messages with ${conversationDisplayName}.`;

  // Get the most recent message timestamp for date separator
  const mostRecentTimestamp =
    conversation.messages.length > 0
      ? conversation.messages[0].createdAt // Assuming messages are sorted by newest first
      : new Date().toISOString();

  // Sort messages by creation date (oldest first for display)
  const sortedMessages = [...conversation.messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <>
      {/* Welcome Message */}
      <div className="flex select-none flex-col items-start px-4 pt-4 pb-6">
        <Avatar
          src={conversationAvatar ?? undefined}
          name={conversationName ?? conversationDisplayName}
          size="2xl"
          className="mb-2"
        />
        <h1 className="mb-2 font-bold text-2xl text-gray-900 dark:text-white">
          {conversationDisplayName}
        </h1>
        <p className="text-gray-600 text-sm dark:text-gray-400">
          <Highlight
            query={conversationDisplayName ?? ""}
            className="font-semibold">
            {welcomeMessage}
          </Highlight>
        </p>
      </div>

      {/* Messages */}
      <div className="pb-4">
        {sortedMessages.length > 0 && (
          <>
            {/* Date Separator for Messages */}
            <div className="flex items-center py-2">
              <hr className="flex-1 border-t" />
              <div className="rounded-lg px-1 text-xs">
                {formatDateSeparator(mostRecentTimestamp)}
              </div>
              <hr className="flex-1 border-t" />
            </div>

            <ul>
              {sortedMessages.map((message, index) => {
                const showAvatar =
                  index === 0 ||
                  sortedMessages[index - 1].sender.id !== message.sender.id;

                const isOwnMessage = message.sender.id === userId;

                return (
                  <Tooltip
                    key={message.id}
                    positioning={{ side: "top", align: "end", offset: -10 }}
                    interactive>
                    <TooltipTrigger asChild>
                      <MessageItem
                        searchParams={searchParams}
                        message={message}
                        showAvatar={showAvatar}
                        isOwnMessage={isOwnMessage}
                      />
                    </TooltipTrigger>
                    {isOwnMessage ? (
                      <TooltipContent className="w-auto min-w-0 duration-200 data-[state=closed]:duration-0">
                        <Card>
                          <CardBody className="p-0">
                            <Menu modal>
                              <MenuTrigger asChild>
                                <IconButton
                                  icon={<Icon as={LuEllipsis} />}
                                  size="xs"
                                  className="w"
                                />
                              </MenuTrigger>
                              <MenuContent className="w-auto">
                                <MenuItem
                                  value="edit"
                                  className="justify-between hover:no-underline"
                                  asChild>
                                  <Link
                                    href={`/channels/me/${conversationId}?messageId=${message.id}&edit=true`}>
                                    <span>Edit Message</span>
                                    <Icon as={LuPencil} />
                                  </Link>
                                </MenuItem>
                                <hr className="my-1 border-gray-200 border-t" />
                                <MenuItem
                                  value="delete"
                                  className="justify-between text-red-500 hover:no-underline"
                                  asChild>
                                  <Link
                                    href={`/channels/me/${conversationId}?messageId=${message.id}&delete=true`}>
                                    <span>Delete Message</span>
                                    <Icon as={LuTrash} />
                                  </Link>
                                </MenuItem>
                              </MenuContent>
                            </Menu>
                          </CardBody>
                        </Card>
                      </TooltipContent>
                    ) : null}
                  </Tooltip>
                );
              })}
            </ul>
          </>
        )}

        {/* Empty state when no messages */}
        {sortedMessages.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Icon
                as={LuHash}
                size="2xl"
                className="mx-auto mb-4 text-gray-400"
              />
              <p className="text-gray-500 text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

type MessageItemProps = {
  message: NonNullable<
    ConversationWithMessagesQuery["conversation"]
  >["messages"][0];
  showAvatar: boolean;
  isOwnMessage: boolean;
  searchParams?: { [key: string]: string | string[] | undefined };
};

function MessageItem({
  message,
  showAvatar,
  isOwnMessage,
  searchParams,
}: MessageItemProps) {
  const messageId = searchParams?.messageId
    ? decodeURI(
        Array.isArray(searchParams.messageId)
          ? searchParams.messageId[0]
          : searchParams.messageId
      )
    : undefined;

  const isEditing =
    searchParams?.edit === "true" && messageId === message.id && isOwnMessage;
  const isDeleting =
    searchParams?.delete === "true" && messageId === message.id && isOwnMessage;

  return (
    <li
      className={cn(
        "group relative flex gap-3 px-4 py-0.5 hover:bg-gray-800/30",
        showAvatar ? "mt-4" : "mt-0.5"
      )}>
      {/* Avatar or spacer */}
      <div className="w-12 flex-shrink-0">
        {showAvatar ? (
          <Avatar
            src={message.sender.avatar ?? undefined}
            name={
              message.sender.displayName ?? message.sender.displayName ?? "User"
            }
            size="sm"
            className="h-12 w-12"
          />
        ) : (
          <div className="w-12 leading-4 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-gray-500 text-xs">
              {formatMessageTime(message.createdAt)}
            </span>
          </div>
        )}
      </div>

      {/* Message content */}
      <div className="min-w-0 flex-1">
        {showAvatar && (
          <div className="mb-0.5 flex items-baseline gap-2">
            <span
              className={`font-medium text-sm ${isOwnMessage ? "text-blue-600 dark:text-blue-400" : ""}`}>
              {isOwnMessage
                ? "You"
                : message.sender.displayName ||
                  message.sender.displayName ||
                  "Unknown User"}
            </span>
            <span className="text-gray-500 text-xs">
              {formatMessageDateTime(message.createdAt)}
            </span>
          </div>
        )}

        {isEditing ? (
          <MessageEditing
            initialContent={message.content}
            messageId={message.id}
          />
        ) : (
          <pre className="flex-shrink-0 whitespace-pre-wrap font-sans text-sm">
            {message.content}
          </pre>
        )}

        {isDeleting ? (
          <MessageDelete
            messageId={message.id}
            conversationId={message.conversationId}>
            <Card>
              <CardBody className="flex-row gap-3 ">
                <Avatar
                  src={message.sender.avatar ?? undefined}
                  name={
                    message.sender.displayName ??
                    message.sender.displayName ??
                    "User"
                  }
                  size="sm"
                  className="h-12 w-12"
                />
                <div className="mb-0.5 flex flex-col items-baseline">
                  <span className="font-semibold text-md">
                    {message.sender.displayName}
                  </span>
                  <pre className="line-clamp-2 flex-shrink-0 whitespace-pre-wrap font-sans text-gray-500 text-sm">
                    {message.content}
                  </pre>
                </div>
              </CardBody>
            </Card>
          </MessageDelete>
        ) : null}

        {/* Show edited indicator if message was edited */}
        {message.editedAt && (
          <span className="text-gray-400 text-xs italic">(edited)</span>
        )}
      </div>
    </li>
  );
}
