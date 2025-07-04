"use client";

import { createGroupConversation } from "@/actions/conversation";
import type { AllUsersQuery } from "@/gql/graphql";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/data-display/card";
import { Button } from "@repo/ui/form/button";
import { Field } from "@repo/ui/form/field";
import { Input } from "@repo/ui/form/input";
import { useActionState } from "react";
import UserListItem from "./channel-user-item";

type ChannelGroupCreationProps = {
  users: AllUsersQuery["allUsers"];
};

export default function ChannelGroupCreation({ users }: ChannelGroupCreationProps) {
  const [_state, formAction] = useActionState(createGroupConversation, {});

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Select Friends</CardTitle>
          <CardDescription>You can add 2 more users.</CardDescription>
        </CardHeader>
        <CardBody>
          <Input placeholder="Type the username of a user" />
          <ul className="mt-2 flex flex-col gap-2">
            {users.map((user) => {
              return <UserListItem key={user.id} user={user} />;
            })}
          </ul>
        </CardBody>
        <CardFooter className="flex-col border-t pt-2">
          <Field label="Group Name (optional)">
            <Input placeholder="Name..." name="name" />
          </Field>
          <Button type="submit" className="w-full">
            Create Conversation
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
