"use client";

import { sendMessage } from "@/actions/message";
import { Card, CardBody } from "@repo/ui/data-display/card";
import { Dialog, DialogBackdrop, DialogContent } from "@repo/ui/overlay/dialog";
import { useActionState, useEffect, useState } from "react";
import { MessageInput } from "./message-input";

type MessageInputFooterProps = { conversationId: string };

export function MessageFooter({ conversationId }: MessageInputFooterProps) {
  const boundAction = sendMessage.bind(null, conversationId);
  const [state, formAction] = useActionState(boundAction, {});

  const [openDialog, setOpenDialog] = useState(false);
  const [scrollToBottom, setScrollToBottom] = useState(false);

  useEffect(() => {
    if (state.error) {
      // Open the dialog when there's an error
      setOpenDialog(true);
    } else if (state.success) {
      setScrollToBottom(true);
    }
  }, [state]);

  useEffect(() => {
    if (scrollToBottom) {
      setScrollToBottom(true);
      // Scroll to bottom on initial load and after revalidation
      const scrollToBottom = () => {
        const messagesBottom = document.getElementById("messages-area");
        if (messagesBottom) {
          messagesBottom.scrollIntoView({ behavior: "smooth" });
          setScrollToBottom(false);
        }
      };

      // Scroll immediately
      scrollToBottom();

      // Also scroll after a short delay to ensure DOM is fully updated
      const timeoutId = setTimeout(scrollToBottom, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [scrollToBottom]);

  return (
    <form action={formAction} className="w-full">
      <MessageInput placeholder="Message @John Doe" />
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogBackdrop />
          <Card>
            <CardBody>
              <p className="text-red-600">{state.error}</p>
            </CardBody>
          </Card>
        </DialogContent>
      </Dialog>
    </form>
  );
}
