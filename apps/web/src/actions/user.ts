import "server-only";

import {
  type CreateUserMutation,
  GetUserQuery,
  GetUserQueryVariables,
  type MutationCreateUserArgs,
  User,
  UserByEmailQuery,
  UserByEmailQueryVariables,
} from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { CREATE_USER } from "@/lib/graphql/mutations";
import { GET_USER_BY_EMAIL, GET_USER_BY_ID } from "@/lib/graphql/queries";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Users, init } from "@kinde/management-api-js";
import { redirect } from "next/navigation";

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { isAuthenticated } = getKindeServerSession();
    return (await isAuthenticated()) ?? false;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
}

/**
 * Get the current authenticated user
 */
export async function getUser(): Promise<User["id"] | null> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    console.error("No user found in session, please ensure user is authenticated");
    return null;
  }

  try {
    const {
      data: { user: existingUser },
    } = await getClient().query<GetUserQuery, GetUserQueryVariables>({
      query: GET_USER_BY_ID,
      variables: { id: user.id },
    });

    if (existingUser) {
      return existingUser.id;
    }

    const identityInfo = await getUserIdentities(user.id);

    if (identityInfo?.type === "email" && "email" in identityInfo && typeof identityInfo.email === "string") {
      const { data } = await getClient().query<UserByEmailQuery, UserByEmailQueryVariables>({
        query: GET_USER_BY_EMAIL,
        variables: {
          email: identityInfo.email,
        },
      });

      if (data?.userByEmail) {
        return data.userByEmail.id;
      }
    }

    const displayName = `${user.given_name || ""} ${user.family_name || ""}`.trim();

    // Try to extract auth method from detailed info first, then fallback to basic detection
    const authProvider = identityInfo?.type !== "email" ? identityInfo?.name?.split(":")[0].toUpperCase() : undefined;

    const { data, errors } = await getClient().mutate<CreateUserMutation, MutationCreateUserArgs>({
      mutation: CREATE_USER,
      variables: {
        id: user.id,
        email: user.email,
        displayName: displayName.length > 0 ? displayName : undefined,
        avatar: user.picture,
        provider: authProvider,
      },
    });

    if (errors) {
      console.error("GraphQL errors:", errors);
      throw new Error("Failed to create user");
    }

    if (!data || !data.createUser) {
      console.error("No user data returned from mutation");
      return null;
    }

    return data.createUser.id;
  } catch (error) {
    console.error("Failed to create user:", error);
    return null;
  }
}

/**
 * Get the current user's ID
 */
export async function getUserId(): Promise<string> {
  try {
    const userId = await getUser();
    if (!userId) {
      console.error("No user found in session, please ensure user is authenticated");
      redirect("/login");
    }
    return userId;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    redirect("/login");
  }
}

/**
 * Get user authentication identities/providers
 */
async function getUserIdentities(userId: string) {
  try {
    init();
    const { identities } = await Users.getUserIdentities({
      userId,
    });

    return identities?.[0] || null; // Return the first identity or null if none found
  } catch (error) {
    console.error("Failed to get user identities:", error);
    return null;
  }
}
