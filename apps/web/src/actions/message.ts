"use server";

import {
  DeleteMessageMutation,
  DeleteMessageMutationVariables,
  EditMessageMutation,
  EditMessageMutationVariables,
  SendMessageMutation,
  SendMessageMutationVariables,
} from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { DELETE_MESSAGE, EDIT_MESSAGE, SEND_MESSAGE } from "@/lib/graphql/mutations";
import { isRedirectError } from "@/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserId } from "./user";

export type FormState = {
  error?: string;
  success?: boolean;
  type?: "validation" | "network" | "server" | "client";
};

export async function sendMessage(conversationId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const content = formData.get("message")?.toString();

    // Validation
    if (!content?.trim()) {
      return {
        error: "Message content is required",
        type: "validation",
      };
    }

    if (content.trim().length > 2000) {
      return {
        error: "Message is too long (max 2000 characters)",
        type: "validation",
      };
    }

    // Get current user
    const userId = await getUserId();

    // Send message via GraphQL
    const { data, errors } = await getClient().mutate<SendMessageMutation, SendMessageMutationVariables>({
      mutation: SEND_MESSAGE,
      variables: {
        content: content.trim(),
        conversationId,
        senderId: userId,
      },
    });

    if (errors) {
      console.error("GraphQL errors:", errors);
      return {
        error: errors.map((error) => error.message).join(", "),
        type: "server",
      };
    }

    if (!data?.sendMessage) {
      return {
        error: "Failed to send message",
        type: "server",
      };
    }

    // Revalidate the conversation page to show the new message
    revalidatePath(`/channels/me/${conversationId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to send message:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to send message",
      type: "server",
    };
  }
}

/**
 * Edit an existing message
 */
export async function editMessage(messageId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const content = formData.get("message")?.toString();

    // Validation
    if (!content?.trim()) {
      return {
        error: "Message content is required",
        type: "validation",
      };
    }

    // Get current user to verify ownership
    const userId = await getUserId();

    // Edit message via GraphQL
    const { data, errors } = await getClient().mutate<EditMessageMutation, EditMessageMutationVariables>({
      mutation: EDIT_MESSAGE,
      variables: {
        messageId,
        content: content.trim(),
        userId, // For authorization check
      },
    });

    if (errors) {
      console.error("GraphQL errors:", errors);
      return {
        error: errors.map((error) => error.message).join(", "),
        type: "server",
      };
    }

    if (!data?.editMessage) {
      return {
        error: "Failed to edit message",
        type: "server",
      };
    }

    // Revalidate the conversation page to show the updated message
    redirect(`/channels/me/${data.editMessage.conversationId}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Failed to edit message:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to edit message",
      type: "server",
    };
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const conversationId = formData.get("conversationId")?.toString();

    // Validation
    if (!conversationId) {
      return {
        error: "Conversation ID is required",
        type: "validation",
      };
    }

    // Get current user to verify ownership
    const userId = await getUserId();

    // Delete message via GraphQL
    const { data, errors } = await getClient().mutate<DeleteMessageMutation, DeleteMessageMutationVariables>({
      mutation: DELETE_MESSAGE,
      variables: {
        messageId,
        userId, // For authorization check
      },
    });

    if (errors) {
      console.error("GraphQL errors:", errors);
      return {
        error: errors.map((error) => error.message).join(", "),
        type: "server",
      };
    }

    if (!data?.deleteMessage) {
      return {
        error: "Failed to delete message",
        type: "server",
      };
    }

    // Revalidate the conversation page to remove the deleted message
    redirect(`/channels/me/${conversationId}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Failed to delete message:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to delete message",
      type: "server",
    };
  }
}
