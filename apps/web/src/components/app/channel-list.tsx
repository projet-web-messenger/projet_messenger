import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/data-display/card";
import { Button, CloseButton, IconButton } from "@repo/ui/form/button";
import { Float } from "@repo/ui/layout/float";
import { Icon } from "@repo/ui/media/icon";
import { LinkBox, LinkOverlay } from "@repo/ui/navigation/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/overlay/tooltip";
import { LuPlus } from "react-icons/lu";
import { Avatar } from "../ui/avatar";

export function ChannelList() {
  return (
    <aside className="relative flex w-52 flex-col border">
      <header className="flex h-12 items-center border-b p-2">
        <Button className="line-clamp-1 w-full text-ellipsis rounded-lg" variant="ghost" size="sm">
          Find or start a conversation
        </Button>
      </header>
      <div className="relative isolate flex min-h-10 flex-col p-2">
        <Button className="w-full justify-start rounded-lg" variant="ghost">
          <Icon asChild>
            <svg className="size-6">
              <use href="/static/assets/icons/user-friend.svg" />
            </svg>
          </Icon>
          <span>Friends</span>
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
        <Button variant="ghost" asChild>
          <Card className="h-auto flex-none flex-row items-start justify-start rounded-lg border-0" asChild>
            <LinkBox>
              <CardHeader className="relative justify-center p-2">
                <Avatar size="md" />
                <Float placement="bottom-end" className="right-3.5 bottom-3.5">
                  <div className="size-3.5 rounded-full border-2 bg-green-500" />
                </Float>
              </CardHeader>
              <CardBody className="h-full justify-center p-2">
                {/* Message Info */}
                <CardTitle className="font-medium text-sm">
                  <LinkOverlay href="/chat/john-doe">John Doe</LinkOverlay>
                </CardTitle>
                <CardDescription className="line-clamp-1 text-ellipsis text-gray-500 text-xs">Last message preview...</CardDescription>
              </CardBody>
              <CardFooter className="h-full items-center justify-between p-2">
                <CloseButton variant="unstyled" size="sm" className="p-0.5 opacity-50 transition-all hover:scale-105 hover:opacity-100" />
              </CardFooter>
            </LinkBox>
          </Card>
        </Button>
      </div>
    </aside>
  );
}
