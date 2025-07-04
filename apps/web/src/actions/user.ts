import "server-only";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function isAuthenticated() {
  const { isAuthenticated } = getKindeServerSession();
  return isAuthenticated();
}

export async function getUser() {
  const { getUser } = getKindeServerSession();
  return getUser();
}
