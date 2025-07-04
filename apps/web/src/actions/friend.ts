"use server";

import {
  FriendRequestStatus,
  RemoveFriendMutation,
  RemoveFriendMutationVariables,
  RespondToFriendRequestMutation,
  RespondToFriendRequestMutationVariables,
} from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { REMOVE_FRIEND, RESPOND_TO_FRIEND_REQUEST } from "@/lib/graphql/mutations";
import { getUserId } from "./user";

export async function respondToFriendRequest(requestId: string, action: FriendRequestStatus) {
  const userId = await getUserId();

  const { data, errors } = await getClient().mutate<RespondToFriendRequestMutation, RespondToFriendRequestMutationVariables>({
    mutation: RESPOND_TO_FRIEND_REQUEST,
    variables: {
      requestId,
      status: action,
      userId,
    },
  });

  if (errors) {
    throw new Error(`Failed to respond to friend request: ${errors.map((error) => error.message).join(", ")}`);
  }

  if (!data || !data.respondToFriendRequest) {
    throw new Error("No data returned from respondToFriendRequest mutation");
  }

  return { success: true, request: data.respondToFriendRequest };
}

export async function removeFriend(friendId: string) {
  const userId = await getUserId();

  const { data, errors } = await getClient().mutate<RemoveFriendMutation, RemoveFriendMutationVariables>({
    mutation: REMOVE_FRIEND,
    variables: {
      friendId,
      userId,
    },
  });

  if (errors) {
    throw new Error(`Failed to remove friend: ${errors.map((error) => error.message).join(", ")}`);
  }

  if (!data || data.removeFriend === null) {
    throw new Error("No data returned from removeFriend mutation");
  }

  return { success: true, removed: data.removeFriend };
}
