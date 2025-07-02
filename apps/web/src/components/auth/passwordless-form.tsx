"use client";

import { handlePasswordlessAuth } from "@/actions/auth";
import { Button } from "@repo/ui/form/button";
import { Field } from "@repo/ui/form/field";
import { Input } from "@repo/ui/form/input";
import { cn } from "@repo/utils/classes";
import { useActionState } from "react";
import { LuLoader } from "react-icons/lu";

type PasswordlessFormProps = {
  connection_id: string;
};

export function PasswordlessForm({ connection_id }: PasswordlessFormProps) {
  const boundAction = handlePasswordlessAuth.bind(null, connection_id);
  const [state, formAction, isPending] = useActionState(boundAction, {});

  return (
    <form action={formAction} className="space-y-3 sm:space-y-4">
      <Field
        disabled={isPending}
        invalid={!!state.fieldErrors?.email}
        errorText={state.fieldErrors?.email}
        label="Email"
        className={cn(
          // Label styles - responsive font sizes
          "*:data-[part=label]:mb-1.5 *:data-[part=label]:font-semibold *:data-[part=label]:text-2xs *:data-[part=label]:text-gray-700 *:data-[part=label]:uppercase *:data-[part=label]:tracking-wider sm:*:data-[part=label]:mb-2 sm:*:data-[part=label]:text-xs dark:*:data-[part=label]:text-gray-300",

          // Helper text styles - responsive
          "*:data-[part=helper-text]:mt-1 *:data-[part=helper-text]:text-2xs *:data-[part=helper-text]:text-gray-500 sm:*:data-[part=helper-text]:text-xs dark:*:data-[part=helper-text]:text-gray-400",
        )}
        helperText="We will send a 6-digit verification code to this email address. It will expire in 2 hours."
        required
      >
        <Input
          name="email"
          mask="email"
          defaultValue={state.fieldValues?.email}
          className="rounded-lg bg-gray-100 text-gray-900 text-sm transition-all focus-visible:outline-purple-500/20 sm:text-md dark:bg-gray-900/50 dark:text-white dark:focus-visible:outline-purple-400/20"
          disabled={isPending}
          variant="subtle"
        />
      </Field>

      <Button
        className="w-full rounded-lg bg-purple-600 text-sm text-white shadow-lg transition-all hover:scale-102 hover:bg-purple-700 hover:shadow-md hover:shadow-purple-500/25 sm:text-md"
        type="submit"
        loading={isPending}
        loadingText="Sending code..."
        spinner={<LuLoader className="mr-2 size-3.5 animate-spin duration-2000 sm:size-4" />}
      >
        Continue
      </Button>
    </form>
  );
}
