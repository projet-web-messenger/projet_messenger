"use client";

import { sendFriendRequest } from "@/actions/friend";
import { Button } from "@repo/ui/form/button";
import { Input } from "@repo/ui/form/input";
import { useState } from "react";

export default function AddFriendForm() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;

    // Call the action to send a friend request
    try {
      await sendFriendRequest(username);
      setError(""); // Clear any previous errors
      (event.target as HTMLFormElement).reset(); // Reset the form
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }

    // Optionally, handle the response or update the UI
  };
  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="relative isolate flex w-full items-center rounded-lg bg-[var(--color-subtle)] px-3 py-1 outline-[var(--color-focus-ring)] focus-within:outline-2 focus-within:outline-solid"
      >
        <Input name="username" placeholder="Enter username" variant="plain" className="h-16 rounded-lg [outline:0]!" size="lg" />
        <Button className="rounded-lg" size="md" variant="solid" type="submit">
          Send Friend Request
        </Button>
      </form>
      {error ? (
        <p className="mt-2 ml-3 text-red-500">{error}</p>
      ) : error === "" ? (
        <p className="mt-2 ml-3 text-green-500">Friend request sent successfully!</p>
      ) : null}
    </div>
  );
}
