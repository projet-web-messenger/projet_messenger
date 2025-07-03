import type { Connection } from "@/actions/misc";
import { handleOAuthLogin } from "@/actions/oauth";
import { Card, CardBody } from "@repo/ui/data-display/card";
import { Button } from "@repo/ui/form/button";
import { Icon } from "@repo/ui/media/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/overlay/tooltip";
import { FaApple, FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";

type OAuthButtonProps = {
  connection: Connection;
};

/**
 * OAuth authentication button with Discord-inspired design
 * Features provider-specific styling and smooth interactions
 */
export function OAuthButton({ connection }: OAuthButtonProps) {
  // Ensure the connection is an OAuth2 strategy
  if (!connection.strategy.startsWith("oauth2:")) {
    return null;
  }

  // Bind connection_id to the server action
  const boundAction = handleOAuthLogin.bind(null, connection.id);

  return (
    <form action={boundAction}>
      <Tooltip lazyMount>
        <TooltipTrigger asChild>
          <Button
            type="submit"
            variant="outline"
            className="w-full rounded-lg text-sm shadow-sm transition-all hover:scale-102 hover:shadow-md active:scale-98 sm:w-20 sm:text-md sm:active:scale-100 sm:hover:scale-100"
          >
            <AuthProviderIcon strategy={connection.strategy} />
            {/* Show text on mobile, hide on larger screens with tooltip */}
            <span className="ml-2 block sm:ml-3 sm:hidden">Continue with {connection.display_name}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="hidden min-w-0 sm:block">
          <Card className="g-white border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <CardBody className="px-2 py-1 text-center text-gray-900 text-xs sm:text-sm dark:text-gray-100">{connection.display_name}</CardBody>
          </Card>
        </TooltipContent>
      </Tooltip>
    </form>
  );
}

type AuthProviderIconProps = {
  strategy: Connection["strategy"];
};

/**
 * Provider icon mapping for OAuth2 authentication strategies
 * Returns appropriate icon based on the OAuth provider type
 */
const PROVIDER_ICONS = {
  google: FcGoogle,
  github: FaGithub,
  apple: FaApple,
} as const;

function AuthProviderIcon({ strategy }: AuthProviderIconProps) {
  // Extract provider name from strategy
  const provider = strategy.split(":")[1] as keyof typeof PROVIDER_ICONS;

  const IconComponent = PROVIDER_ICONS[provider];

  return <Icon as={IconComponent} className="size-6" />;
}
