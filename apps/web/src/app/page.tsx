import { isAuthenticated } from "@/actions/user";
import { redirect } from "next/navigation";

/**
 * Home page that redirects users based on authentication status
 * - Unauthenticated users -> /login
 * - Authenticated users -> /channels/@me
 */
export default async function HomePage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  // Redirect authenticated users to the main app
  redirect("/channels/me");
}

// Add metadata for better SEO
export const metadata = {
  title: "Messenger App",
  description: "Connect and chat with friends",
};

// Disable static generation since this page depends on authentication
export const dynamic = "force-dynamic";
