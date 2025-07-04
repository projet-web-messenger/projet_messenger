import { Card } from "@repo/ui/data-display/card";
import { IconButton } from "@repo/ui/form/button";
import { Input, InputGroup } from "@repo/ui/form/input";
import { Float } from "@repo/ui/layout/float";
import { Icon } from "@repo/ui/media/icon";
import { Dialog, DialogBackdrop, DialogContent, DialogTrigger } from "@repo/ui/overlay/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/overlay/tooltip";
import { LuBell, LuPin, LuSearch, LuUsers } from "react-icons/lu";
import { Avatar } from "../ui/avatar";
import FriendProfile from "./friend-profile";

type MessageHeaderProps = {
  conversationId: string;
  conversationAvatar?: string | null;
  conversationName?: string | null;
  conversationDisplayName?: string | null;
};

export default async function MessageHeader({ conversationId, conversationAvatar, conversationName, conversationDisplayName }: MessageHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Avatar src={conversationAvatar ?? undefined} name={conversationName ?? undefined} size="sm" />
          <Float placement="bottom-end" className="right-1.5 bottom-1.5">
            <div className="size-3.5 rounded-full border-2 bg-green-500" />
          </Float>
        </div>
        <span className="font-semibold">{conversationDisplayName}</span>
      </div>

      <div className="flex-1" />

      {/* Right side - Actions */}
      <div className="flex items-center gap-1">
        <Tooltip positioning={{ side: "top", align: "center" }}>
          <TooltipTrigger asChild>
            <IconButton icon={<LuBell />} variant="ghost" size="sm" />
          </TooltipTrigger>
          <TooltipContent className="w-auto min-w-0">
            <Card className="g-white border">
              <p className="px-2 py-1 text-center text-sm">Notifications</p>
            </Card>
          </TooltipContent>
        </Tooltip>
        <Tooltip positioning={{ side: "top", align: "center" }}>
          <TooltipTrigger asChild>
            <IconButton icon={<LuPin className="rotate-45" />} variant="ghost" size="sm" />
          </TooltipTrigger>
          <TooltipContent className="w-auto min-w-0">
            <Card className="g-white border">
              <p className="px-2 py-1 text-center text-sm">Pinned messages</p>
            </Card>
          </TooltipContent>
        </Tooltip>
        <Tooltip positioning={{ side: "top", align: "center" }}>
          <Dialog portalled>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <IconButton icon={<LuUsers />} variant="ghost" size="sm" />
              </DialogTrigger>
            </TooltipTrigger>
            <DialogContent variant="drawer" positioning={{ side: "right" }} className="w-96 max-w-sm">
              <DialogBackdrop />
              <FriendProfile conversationId={conversationId} />
            </DialogContent>
          </Dialog>
          <TooltipContent className="w-auto min-w-0">
            <Card className="g-white border">
              <p className="px-2 py-1 text-center text-sm">Add friends to DM</p>
            </Card>
          </TooltipContent>
        </Tooltip>

        <InputGroup endElement={<Icon as={LuSearch} />} className="w-72 min-w-48">
          <Input placeholder="Search" variant="subtle" className="rounded-lg" size="sm" />
        </InputGroup>
      </div>
    </>
  );
}
