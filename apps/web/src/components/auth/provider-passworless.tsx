"use client";

import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@repo/ui/form/button";
import { Field } from "@repo/ui/form/field";
import { Input } from "@repo/ui/form/input";
import { loginSchema } from "@repo/utils/schemas/auth";
import { useState } from "react";
import { LuRefreshCcw } from "react-icons/lu";

/**
 * Props for the passwordless authentication provider component
 * @property {string} connection_id - Kinde connection identifier for the auth provider
 */
type AuthProviderPasswordless = {
  connection_id: string;
};

/**
 * Renders a passwordless authentication form that leverages Kinde Auth
 * This component provides email-based authentication with no password required
 */
export default function AuthProviderPasswordless(props: AuthProviderPasswordless) {
  const { connection_id } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const startLoading = () => {
    setIsLoading(true);
  };

  /**
   * Handles form submission by updating the RegisterLink with the user's email
   * and triggering the Kinde authentication flow
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const handlePasswordlessAuth = async () => {
      // wait 2 seconds before starting the loading state
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const payload = new FormData(event.target as HTMLFormElement);
      const email = payload.get("email") as string;

      // Validate email input
      const parsedEmail = loginSchema.safeParse({ email });
      if (!parsedEmail.success) {
        // If validation fails, reset loading state and return
        setIsLoading(false);
        setErrorMessage(parsedEmail.error.errors[0].message);
        return;
      }

      // Modify the Kinde auth link with the provided email and trigger authentication
      const registerLink = document.getElementById("kinde-auth-passwordless-link") as HTMLAnchorElement;
      if (registerLink) {
        registerLink.href = registerLink.href.replace("login_hint=", `login_hint=${encodeURIComponent(email)}`);
        registerLink.click();
      }
    };

    event.preventDefault();
    setIsLoading(true); // Reset loading state on form submission

    handlePasswordlessAuth();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field invalid={!!errorMessage} errorText={errorMessage} label="Email" helperText="Enter your email to receive a magic link">
        <Input name="email" />
      </Field>

      <Button
        className="w-full"
        loading={isLoading}
        loadingText="Sending magic link"
        spinner={<LuRefreshCcw className="mr-2 size-5 animate-spin duration-slowest" />}
        type="submit"
      >
        {/* Hidden link that gets programmatically clicked after form submission */}
        <RegisterLink
          id="kinde-auth-passwordless-link"
          authUrlParams={{
            connection_id: connection_id,
            login_hint: "", // Placeholder - replaced with user's email on submit
          }}
          className="sr-only"
        >
          Sign in with email
        </RegisterLink>
        Sign in with email
      </Button>
    </form>
  );
}
