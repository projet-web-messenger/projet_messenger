import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { Card, CardBody, CardDescription, CardFooter, CardTitle } from "@repo/ui/data-display/card";
import { Button } from "@repo/ui/form/button";
import { Dialog, DialogBackdrop, DialogContent, DialogTrigger, DialogTriggerAction } from "@repo/ui/overlay/dialog";

export default function Logout() {
  return (
    <Dialog portalled>
      <DialogTrigger asChild>
        <Button className="w-full">Log Out</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogBackdrop />
        <Card>
          <CardBody>
            <CardTitle>Sign Out</CardTitle>
            <CardDescription>Are you sure you want to log out? You will be redirected to the login page.</CardDescription>
          </CardBody>
          <CardFooter className="flex justify-end">
            <DialogTriggerAction asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </DialogTriggerAction>
            <DialogTriggerAction asChild>
              <Button variant="solid" size="sm" className="ml-2 hover:no-underline" asChild>
                <LogoutLink>Log Out</LogoutLink>
              </Button>
            </DialogTriggerAction>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
