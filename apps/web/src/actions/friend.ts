"use server";

import {
  FriendRequestStatus,
  RemoveFriendMutation,
  RemoveFriendMutationVariables,
  RespondToFriendRequestMutation,
  RespondToFriendRequestMutationVariables,
  SendFriendRequestMutation,
  SendFriendRequestMutationVariables,
  UserByUsernameQuery,
  UserByUsernameQueryVariables,
} from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { REMOVE_FRIEND, RESPOND_TO_FRIEND_REQUEST, SEND_FRIEND_REQUEST } from "@/lib/graphql/mutations";
import { GET_USER_BY_USERNAME } from "@/lib/graphql/queries";
import { revalidatePath } from "next/cache";
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

  revalidatePath("/channels/me");
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

  revalidatePath("/channels/me");
}

export async function sendFriendRequest(username: string) {
  console.log("Sending friend request to:", username);
  if (!username) {
    throw new Error("Username is required to send a friend request");
  }

  const {
    data: { userByUsername },
  } = await getClient().query<UserByUsernameQuery, UserByUsernameQueryVariables>({
    query: GET_USER_BY_USERNAME,
    variables: { username },
  });

  console.log("User found by username:", userByUsername);

  if (!userByUsername) {
    throw new Error(`User with username ${username} not found`);
  }

  const userId = await getUserId();

  const { data } = await getClient().mutate<SendFriendRequestMutation, SendFriendRequestMutationVariables>({
    mutation: SEND_FRIEND_REQUEST,
    variables: {
      senderId: userId,
      receiverId: userByUsername.id,
    },
  });

  console.log("Friend request data:", data);

  if (!data || !data.sendFriendRequest) {
    throw new Error("Failed to send friend request");
  }

  revalidatePath("/channels/me");
}
