import ChannelList from "@/components/app/channel-list";
import ChannelSelectFriends from "@/components/app/channel-select-friends";
import { Link } from "@/components/ui/link";
import { Card } from "@repo/ui/data-display/card";
import { Button, IconButton } from "@repo/ui/form/button";
import { Icon } from "@repo/ui/media/icon";
import { Dialog, DialogBackdrop, DialogContent, DialogTrigger } from "@repo/ui/overlay/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/overlay/tooltip";
import { LuPlus } from "react-icons/lu";
import Logout from "./Logout";

export type Params = { id: string };

type ChannelLayoutProps = {
  children: Readonly<React.ReactNode>;
};

export default function ChannelLayout({ children }: ChannelLayoutProps) {
  return (
    <div className="flex h-dvh">
      <aside className="relative flex w-72 flex-col border">
        <header className="flex h-12 items-center border-b p-2">
          <Dialog portalled>
            <DialogTrigger asChild>
              <Button className="line-clamp-1 w-full text-ellipsis rounded-lg" variant="ghost" size="sm">
                Find or start a conversation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogBackdrop />
              <ChannelSelectFriends />
            </DialogContent>
          </Dialog>
        </header>
        <div className="relative isolate flex min-h-10 flex-1 flex-col gap-3 p-2">
          <Button className="w-full justify-start rounded-lg" variant="ghost" asChild>
            <Link href="/channels/me">
              <Icon asChild>
                <svg className="size-6">
                  <use href="/static/assets/icons/user-friend.svg" />
                </svg>
              </Icon>
              <span>Friends</span>
            </Link>
          </Button>
          <hr className="my-3 border-t" />
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-sm">Private messages</p>
            <Tooltip positioning={{ side: "top", align: "center" }}>
              <TooltipTrigger asChild>
                <IconButton icon={<LuPlus />} variant="unstyled" size="sm" className="p-0.5" />
              </TooltipTrigger>
              <TooltipContent className="w-auto min-w-0">
                <Card className="g-white border">
                  <p className="px-2 py-1 text-center text-sm">Create a MP</p>
                </Card>
              </TooltipContent>
            </Tooltip>
          </div>
          <ChannelList />
          <div className="flex-1" />
          <Button asChild className="hover:no-underline">
            <Link href="/settings/account" className="flex items-center gap-2">
              Settings
            </Link>
          </Button>
          <Logout />
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
