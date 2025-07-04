import { type FriendsQuery, UserStatus } from "@/gql/graphql";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/data-display/card";
import { Button } from "@repo/ui/form/button";
import { Float } from "@repo/ui/layout/float";
import { LinkBox, LinkOverlay } from "@repo/ui/navigation/link";
import { cn } from "@repo/utils/classes";
import { Avatar } from "../ui/avatar";

type UserListItemProps = {
  user: FriendsQuery["friends"][number];
};

export default function UserListItem({ user }: UserListItemProps) {
  return (
    <Button variant="ghost" asChild>
      <Card className="h-auto flex-none flex-row items-start justify-start rounded-lg border-0" asChild>
        <LinkBox>
          <CardHeader className="relative justify-center p-2">
            <Avatar src={user.avatar ?? undefined} name={user.username ?? undefined} size="md" />
            <Float placement="bottom-end" className="right-3.5 bottom-3.5">
              <div className={cn("size-3.5 rounded-full border-2", user.status === UserStatus.Online ? "bg-green-500" : " bg-gray-300")} />
            </Float>
          </CardHeader>
          <CardBody className="h-full justify-center p-2">
            {/* Message Info */}
            <CardTitle className="font-medium text-sm">{user.displayName}</CardTitle>
            <CardDescription className="line-clamp-1 text-ellipsis text-gray-500 text-xs">{user.username}</CardDescription>
          </CardBody>
          <CardFooter className="h-full flex-col items-center self-center p-0 pr-2">
            <LinkOverlay asChild>
              <input type="checkbox" name="friends-checked" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus-visible:ring-blue-500" />
            </LinkOverlay>
            <input type="hidden" value={user.id} name="friends" />
          </CardFooter>
        </LinkBox>
      </Card>
    </Button>
  );
}
