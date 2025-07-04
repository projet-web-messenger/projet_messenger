"use server";

import { UpdateUserMutation, UpdateUserMutationVariables } from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { UPDATE_USER } from "@/lib/graphql/mutations";
import { revalidatePath } from "next/cache";
import { getUserId } from "./user";

export async function updateUserInfo(displayName: string) {
  if (!displayName.trim()) {
    throw new Error("Display name cannot be empty");
  }

  const userId = await getUserId();

  const { data } = await getClient().mutate<UpdateUserMutation, UpdateUserMutationVariables>({
    mutation: UPDATE_USER,
    variables: {
      id: userId,
      displayName,
    },
  });

  if (!data || !data.updateUser) {
    throw new Error("Failed to update user information");
  }

  revalidatePath("/settings/profile");
}
