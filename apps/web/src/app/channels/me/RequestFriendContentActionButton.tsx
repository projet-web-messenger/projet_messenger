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
  const handleAccept = () => {
    respondToFriendRequest(requestId, FriendRequestStatus.Accepted);
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
