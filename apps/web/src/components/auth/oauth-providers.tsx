import { getConnections } from "@/actions/misc";
import { OAuthButton } from "./oauth-button";

/**
 * Server component that fetches and renders OAuth2 authentication providers
 * Discord-inspired design with enhanced visual styling
 */
export async function OAuthProviders() {
  const connections = await getConnections();

  // Filter for OAuth2 providers only
  const oauthConnections = connections?.filter((connection) => connection?.strategy?.startsWith("oauth2:")) ?? [];

  if (oauthConnections.length === 0) {
    return null; // No OAuth2 providers available
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      {oauthConnections.map((connection) => {
        return <OAuthButton key={connection.id} connection={connection} />;
      })}
    </div>
  );
}
