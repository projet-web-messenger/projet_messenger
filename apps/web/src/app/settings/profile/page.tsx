import { getUserId } from "@/actions/user";
import type { GetUserQuery, GetUserQueryVariables } from "@/gql/graphql";
import { getClient } from "@/lib/apollo-client";
import { GET_USER_BY_ID } from "@/lib/graphql/queries";
import ProfileArea from "./ProfileArea";

export default async function Page() {
  const userId = await getUserId();

  const {
    data: { user },
  } = await getClient().query<GetUserQuery, GetUserQueryVariables>({
    query: GET_USER_BY_ID,
    variables: { id: userId },
  });

  return <ProfileArea userInfo={user} />;
}
