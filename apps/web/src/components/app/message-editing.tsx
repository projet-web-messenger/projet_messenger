"use client";

import { editMessage } from "@/actions/message";
import { Card, CardBody } from "@repo/ui/data-display/card";
import { Button } from "@repo/ui/form/button";
import { Field } from "@repo/ui/form/field";
import { Dialog, DialogBackdrop, DialogContent } from "@repo/ui/overlay/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { MessageInput } from "./message-input";

type EditMessageProps = {
  messageId: string;
  initialContent: string;
};

export default function MessageEditing({ messageId, initialContent }: EditMessageProps) {
  const boundAction = editMessage.bind(null, messageId);
  const [state, formAction] = useActionState(boundAction, {});
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const cancelEdit = () => {
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) {
      router.back();
    }
    router.push(`/channels/me/${conversationId}`);
  };

  useEffect(() => {
    if (state.error) {
      // Open the dialog when there's an error
      setOpenDialog(true);
    }
  }, [state.error]);

  return (
    <form action={formAction}>
      <Field>
        <MessageInput defaultValue={initialContent} variant="outline" />
        <span className="flex items-center gap-1 text-gray-500 text-xs">
          <span>escape to</span>
          <Button variant="link" className="text-blue-500 text-xs" onClick={cancelEdit}>
            cancel
          </Button>
          <span>• enter to</span>
          <Button type="submit" variant="link" className="text-blue-500 text-xs">
            save
          </Button>
        </span>
      </Field>

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
