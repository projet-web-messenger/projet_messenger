import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { isAuthenticated } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  // Redirect authenticated users to the main app
  redirect("/app");
}
