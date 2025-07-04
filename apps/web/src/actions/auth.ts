"use server";

import { isRedirectError } from "@/utils";
import { loginSchema } from "@repo/utils/schemas/auth";
import { redirect } from "next/navigation";

export type FormState = {
  error?: string;
  type?: "validation" | "network" | "server" | "client";
  fieldErrors?: { email?: string };
  fieldValues?: { email?: string };
};

/**
 * Server action to handle email submission and redirect to Kinde auth
 * Validates email format before redirecting to authentication flow
 *
 * @param connection_id - Kinde connection identifier for the auth provider
 * @param prevState - Previous form state for error handling
 * @param formData - Form data containing the email
 */
export async function handlePasswordlessAuth(connection_id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get("email")?.toString() ?? "";

  // Early return for empty email
  if (!email.trim()) {
    return createErrorState("Email is required", "validation", email);
  }

  try {
    // Validate email format before sending verification code
    const validationResult = loginSchema.safeParse({ email });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return createErrorState(firstError.message, "validation", email);
    }

    // Build auth URL for Kinde verification
    const authParams = new URLSearchParams({
      connection_id,
      login_hint: validationResult.data.email,
    });

    const authUrl = `/api/auth/register?${authParams.toString()}`;

    // Redirect to Kinde auth - this will send a 6-digit verification code
    // to the user's email (expires in 2 hours)
    redirect(authUrl);
  } catch (error) {
    // Handle redirect errors (expected behavior)
    if (isRedirectError(error)) {
      throw error;
    }

    // Handle unexpected server errors
    return createErrorState(error instanceof Error ? error.message : "An unexpected error occurred", "server", email);
  }
}

/**
 * Helper function to create consistent error state objects
 */
function createErrorState(message: string, type: FormState["type"], email: string): FormState {
  return {
    error: message,
    type,
    fieldErrors: type === "validation" ? { email: message } : undefined,
    fieldValues: { email },
  };
}
