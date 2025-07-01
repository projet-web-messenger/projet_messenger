"use client";

import { IconButton } from "@repo/ui/form/button";
import { Input, InputGroup } from "@repo/ui/form/input";
import { Icon } from "@repo/ui/media/icon";
import { useState } from "react";
import { LuPlus, LuSmile } from "react-icons/lu";

export function MessageInput() {
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim()) {
      setMessage("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <InputGroup
        startElement={<IconButton icon={<LuPlus />} variant="unstyled" className="opacity-60 hover:opacity-100" />}
        endElement={<Icon as={LuSmile} />}
        className="w-full"
      >
        <Input
          as="textarea"
          placeholder="Message @John Doe"
          variant="subtle"
          className="h-[3.25rem] resize-none py-4"
          size="md"
          rows={1}
          onKeyDown={handleKeyDown}
        />
      </InputGroup>
    </form>
  );
}
