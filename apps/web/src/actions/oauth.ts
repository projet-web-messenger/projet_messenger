"use server";

import { redirect } from "next/navigation";

/**
 * Server action to handle OAuth2 authentication redirect
 * Builds the authentication URL and redirects to Kinde OAuth flow
 *
 * @param connection_id - OAuth provider connection identifier
 */
export async function handleOAuthLogin(connection_id: string) {
  try {
    // Build OAuth authentication URL
    const authParams = new URLSearchParams({
      connection_id,
    });

    const authUrl = `/api/auth/register?${authParams.toString()}`;

    // Redirect to Kinde OAuth flow
    redirect(authUrl);
  } catch (error) {
    // Handle redirect errors (expected behavior)
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    throw new Error("Authentication failed. Please try again.");
  }
}
