"use client";

import { createDirectMessage } from "@/actions/conversation";
import { removeFriend } from "@/actions/friend";
import { Card, CardBody, CardDescription, CardFooter, CardTitle } from "@repo/ui/data-display/card";
import { Button, IconButton } from "@repo/ui/form/button";
import { Icon } from "@repo/ui/media/icon";
import { Dialog, DialogBackdrop, DialogContent, DialogTrigger, DialogTriggerAction } from "@repo/ui/overlay/dialog";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@repo/ui/overlay/menu";
import { LuEllipsisVertical } from "react-icons/lu";

type FriendContentActionButtonProps = { friendId: string };

export default function FriendContentActionButton({ friendId }: FriendContentActionButtonProps) {
  const handleCreateDirectMessage = async () => {
    createDirectMessage(friendId);
  };

  const handleRemoveFriend = async () => {
    try {
      await removeFriend(friendId);
    } catch (error) {
      console.error("Failed to remove friend:", error);
      // Optionally, handle the error (e.g., show a notification)
    }
  };

  return (
    <>
      <Dialog role="alertdialog" portalled>
        <div>
          <Menu>
            <MenuTrigger asChild>
              <IconButton icon={<Icon as={LuEllipsisVertical} />} variant="ghost" />
            </MenuTrigger>
            <MenuContent className="w-auto">
              <MenuItem value="start-conversation" onSelect={handleCreateDirectMessage}>
                Start Conversation
              </MenuItem>
              <MenuItem value="remove-friend" className="text-red-500" closeOnSelect={false}>
                <DialogTrigger>Remove Friend</DialogTrigger>
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
        <DialogBackdrop />
        <DialogContent>
          <Card>
            <CardBody>
              <CardTitle>Remove Friend</CardTitle>
              <CardDescription>Are you sure you want to remove this Friend from your friends?</CardDescription>
            </CardBody>
            <CardFooter className="flex justify-end">
              <DialogTriggerAction asChild>
                <Button variant="ghost" size="sm">
                  Cancel
                </Button>
              </DialogTriggerAction>
              <DialogTriggerAction asChild>
                <Button variant="solid" size="sm" className="ml-2 bg-red-500" onClick={handleRemoveFriend}>
                  Remove Friend
                </Button>
              </DialogTriggerAction>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}
