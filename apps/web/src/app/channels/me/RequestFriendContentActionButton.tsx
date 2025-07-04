"use client";

import { respondToFriendRequest } from "@/actions/friend";
import { FriendRequestStatus } from "@/gql/graphql";
import { IconButton } from "@repo/ui/form/button";
import { Icon } from "@repo/ui/media/icon";
import { LuCheck, LuX } from "react-icons/lu";

type RequestFriendContentActionButtonProps = {
  requestId: string;
};

export default function RequestFriendContentActionButton({ requestId }: RequestFriendContentActionButtonProps) {
  const handleAccept = async () => {
    try {
      await respondToFriendRequest(requestId, FriendRequestStatus.Accepted);
    } catch (error) {
      console.error("Failed to accept friend request:", error);
      // Optionally, handle the error (e.g., show a notification)
    }
  };

  const handleReject = () => {
    respondToFriendRequest(requestId, FriendRequestStatus.Declined);
  };

  return (
    <>
      <IconButton icon={<Icon as={LuCheck} />} variant="ghost" className="rounded-full" onClick={handleAccept} />
      <IconButton icon={<Icon as={LuX} />} variant="ghost" className="rounded-full" onClick={handleReject} />
    </>
  );
}
