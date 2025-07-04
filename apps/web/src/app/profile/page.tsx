import { getUser } from "@/actions/user";
import { Avatar } from "@/components/ui/avatar";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { Card, CardBody } from "@repo/ui/data-display/card";
import { Button } from "@repo/ui/form/button";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const userInfo = await getUser();

  if (!userInfo) {
    return redirect("/login?error=no_user");
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar src={userInfo.avatar || "/static/assets/default-avatar.png"} alt="User avatar" width={64} height={64} className="rounded-full" />
            <div>
              <h2 className="font-bold text-xl">
                {userInfo.displayName}
                {userInfo.username && <span className="text-gray-500 text-sm"> @{userInfo.username}</span>}
              </h2>
              <p className="text-sm opacity-60">{userInfo.email}</p>
            </div>
          </div>
          <p className="text-sm">User ID: {userInfo.id}</p>
          {userInfo.bio && <p className="text-sm">Bio: {userInfo.bio}</p>}
          <Button className="w-full" asChild>
            <LogoutLink>Logout</LogoutLink>
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
