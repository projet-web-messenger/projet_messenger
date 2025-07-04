"use client";

import { deleteMessage } from "@/actions/message";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/data-display/card";
import { Button } from "@repo/ui/form/button";
import { Dialog, DialogBackdrop, DialogContent } from "@repo/ui/overlay/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

type EditMessageProps = {
  children: React.ReactNode;
  messageId: string;
  conversationId: string;
};

export default function MessageDelete({ children, messageId, conversationId }: EditMessageProps) {
  const boundAction = deleteMessage.bind(null, messageId);
  const [state, formAction] = useActionState(boundAction, {});
  const [openDialog, setOpenDialog] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const cancelDelete = () => {
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
    <Dialog role="alertdialog" open={openDialog} onOpenChange={setOpenDialog} portalled>
      <DialogBackdrop />
      <DialogContent>
        <form action={formAction}>
          <input type="hidden" name="conversationId" value={conversationId ?? undefined} />
          <Card>
            <CardHeader>
              <CardTitle>Delete Message</CardTitle>
              <CardDescription>Are you sure you want to delete this message?</CardDescription>
            </CardHeader>
            <CardBody>{children}</CardBody>
            <CardFooter className="justify-end">
              <Button variant="ghost" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button type="submit" variant="solid" className="ml-2 bg-red-500">
                Delete
              </Button>
            </CardFooter>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
}
