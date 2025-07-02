"use client";

import { IconButton } from "@repo/ui/form/button";
import { Input } from "@repo/ui/form/input";
import { Icon } from "@repo/ui/media/icon";
import { LuPlus, LuSmile } from "react-icons/lu";

export function MessageInput() {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const message = new FormData(form).get("message") as string;
    if (message.trim()) {
      // Reset the form or input field if needed
      form.reset();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const form = event.currentTarget.form as HTMLFormElement;
      // Dispatch a submit event to trigger the form submission
      form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="relative isolate flex min-h-14 w-full rounded-lg bg-[var(--color-subtle)] px-3 py-1 outline-[var(--color-focus-ring)] focus-within:outline-2 focus-within:outline-solid">
        <div className="pt-2">
          <IconButton icon={<LuPlus />} variant="unstyled" className="opacity-60 hover:opacity-100" />
        </div>
        <Input
          as="textarea"
          name="message"
          placeholder="Message @John Doe"
          variant="plain"
          className="max-h-32 resize-none pt-3 [outline:0]!"
          size="md"
          rows={1}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <div className="pt-2">
          <Icon as={LuSmile} />
        </div>
      </div>
    </form>
  );
}
