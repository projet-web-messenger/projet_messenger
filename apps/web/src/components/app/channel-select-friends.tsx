import { getUserId } from "@/actions/user";
import type { AllUsersQuery } from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { GET_ALL_USERS } from "@/lib/graphql/queries";
import ChannelGroupCreation from "./channel-group-creation";

export default async function ChannelSelectFriends() {
  const userId = await getUserId();

  const {
    data: { allUsers },
  } = await getClient().query<AllUsersQuery>({
    query: GET_ALL_USERS,
  });

  const filteredUsers = allUsers.filter((user) => user.id !== userId);

  return <ChannelGroupCreation users={filteredUsers} />;
}
