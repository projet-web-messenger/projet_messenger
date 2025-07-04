import { getUserId } from "@/actions/user";
import { GetUserQuery, GetUserQueryVariables } from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { GET_USER_BY_ID } from "@/lib/graphql/queries";
import AccountClient from "./AccountClient";

export default async function AccountPage() {
  const userId = await getUserId();

  const {
    data: { user },
  } = await getClient().query<GetUserQuery, GetUserQueryVariables>({
    query: GET_USER_BY_ID,
    variables: { id: userId },
  });

  return <AccountClient userInfo={user} />;
}
