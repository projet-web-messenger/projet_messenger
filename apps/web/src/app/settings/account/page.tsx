import { getUser } from "@/actions/user";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";

export default async function AccountPage() {
  const userInfo = await getUser();

  if (!userInfo) {
    redirect("/login");
  }

  return <AccountClient userInfo={userInfo} />;
}
