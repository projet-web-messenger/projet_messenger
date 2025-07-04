import { getUserId } from "@/actions/user";
import type { ConversationQuery, ConversationQueryVariables } from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { GET_CONVERSATION } from "@/lib/graphql/queries";
import { Card, CardBody, CardHeader } from "@repo/ui/data-display/card";
import { redirect } from "next/navigation";
import { Avatar } from "../ui/avatar";

type FriendProfileProps = {
  conversationId: string;
};

export default async function FriendProfile({ conversationId }: FriendProfileProps) {
  const userId = await getUserId();

  const {
    data: { conversation },
  } = await getClient().query<ConversationQuery, ConversationQueryVariables>({
    query: GET_CONVERSATION,
    variables: {
      conversationId,
    },
  });

  if (!conversation) {
    redirect("/channels/me");
  }

  const friend = conversation.users.find((userConversation) => userConversation.user.id !== userId)?.user;

  return conversation.users.map((userConversation) => {
    if (userConversation.user.id === userId) {
      return;
    }
    const participant = userConversation.user;

    return (
      <Card key={participant.id}>
        <CardHeader>
          <Avatar src={friend?.avatar ?? undefined} name={friend?.displayName ?? undefined} size="lg" />
        </CardHeader>
        <CardBody>
          <h2 className="font-semibold text-lg">{friend?.displayName}</h2>
          <p className="text-gray-500 text-sm">{friend?.username}</p>
          <div className="text-xs">
            <span>Member since</span>
            <span className="font-semibol">
              {new Date(friend?.createdAt ?? "").toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </CardBody>
      </Card>
    );
  });
}
