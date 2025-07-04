"use server";

import {
  ConversationType,
  CreateConversationMutation,
  CreateConversationMutationVariables,
  CreateDirectMessageMutation,
  CreateDirectMessageMutationVariables,
} from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { CREATE_DIRECT_MESSAGE, CREATE_GROUP_CONVERSATION } from "@/lib/graphql/mutations";
import { isRedirectError } from "@/utils";
import { redirect } from "next/navigation";
import { getUserId } from "./user";

export type FormState = {
  error?: string;
  success?: boolean;
  type?: "validation" | "network" | "server" | "client";
};

export async function createDirectMessage(friendId: string) {
  try {
    const userId = await getUserId();

    const { data, errors } = await getClient().mutate<CreateDirectMessageMutation, CreateDirectMessageMutationVariables>({
      mutation: CREATE_DIRECT_MESSAGE,
      variables: {
        userId1: userId,
        userId2: friendId,
      },
    });

    console.log("createDirectMessage", { data, errors });

    if (errors) {
      throw new Error(errors.map((error) => error.message).join(", "));
    }

    if (!data?.createDirectMessage) {
      throw new Error("Failed to create direct message");
    }

    redirect(`/channels/me/${data.createDirectMessage.id}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
  }
}

export async function createGroupConversation(_prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const entries = Array.from(formData.entries());
    const selectedFriends: string[] = [];
    for (let i = 0; i < entries.length; i += 1) {
      console.log("Processing entry:", entries[i], entries[i + 1]);
      if (i + 1 >= entries.length) {
        break; // Ensure we don't go out of bounds
      }

      if (entries[i][1] === "on") {
        selectedFriends.push(entries[i + 1][1] as string); // Push the friend ID
      }
    }

    const name = formData.get("name") as string;
    const friendIds = selectedFriends.filter((id) => id !== ""); // Filter out empty strings

    if (friendIds.length < 1) {
      return {
        error: "You must select at least 2 friends to create a group conversation.",
        type: "validation",
      };
    }

    const userId = await getUserId();

    if (friendIds.length === 1) {
      // If only one friend is selected, create a direct message instead of a group conversation
      await createDirectMessage(friendIds[0]);
      return { success: true }; // Indicate success for the action
    }

    const { data, errors } = await getClient().mutate<CreateConversationMutation, CreateConversationMutationVariables>({
      mutation: CREATE_GROUP_CONVERSATION,
      variables: {
        type: ConversationType.GroupChat,
        name,
        userIds: [userId, ...friendIds],
        description: null, // Optional description can be added later
      },
    });

    if (errors) {
      return {
        error: errors.map((error) => error.message).join(", "),
        type: "network",
      };
    }

    if (!data?.createConversation) {
      return {
        error: "Failed to create group conversation",
        type: "server",
      };
    }

    redirect(`/channels/me/${data.createConversation.id}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      error: error instanceof Error ? error.message : "Failed to create group conversation",
      type: "server",
    };
  }
}
