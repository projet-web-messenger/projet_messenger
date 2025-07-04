"use client";

import { Input } from "@repo/ui/form/input";
import { composeRefs } from "@repo/utils/compose-refs";
import { useEffect, useRef } from "react";

export function MessageInput({ ref, ...props }: React.ComponentProps<typeof Input>) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleRef = composeRefs(inputRef, ref as React.Ref<HTMLTextAreaElement>);

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

  useEffect(() => {
    // Set initial height based on content
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }
  }, []);

  return (
    <>
      <Input
        as="textarea"
        ref={handleRef}
        name="message"
        variant="plain"
        className="max-h-32 resize-none pt-3 [outline:0]!"
        size="md"
        rows={1}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </>
  );
}
