import AuthProviderIcon from "@/components/auth/provider-icon";
import AuthProviderPasswordless from "@/components/auth/provider-passworless";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Card, CardBody } from "@repo/ui/data-display/card";
import { Button } from "@repo/ui/form/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/overlay/tooltip";
import { getConnections } from "../actions/misc";

export default async function LoginPage() {
  const connections = await getConnections();

  const passwordlessConnection = connections?.find((connection) => connection?.strategy === "email:otp");

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <h2 className="text-center font-bold text-2xl">Login to Messenger</h2>
        <p className="text-center text-sm opacity-60">Please log in to continue.</p>
        <div className="space-y-4">
          {passwordlessConnection ? <AuthProviderPasswordless connection_id={passwordlessConnection.id} /> : null}
          <div className="flex items-center justify-between">
            <hr className="w-full border-gray-300 border-t border-dashed" />
            <span className="px-2 text-gray-500 text-sm">or</span>
            <hr className="w-full border-gray-300 border-t border-dashed" />
          </div>
          <div className="flex items-center justify-center gap-2">
            {connections
              ?.filter((connection) => connection?.strategy?.includes("oauth2"))
              .map((connection) => {
                if (!connection) {
                  return null;
                }
                return (
                  <Tooltip key={connection.id} portalled>
                    <TooltipTrigger asChild>
                      <Button className="w-full max-w-20 [&>svg]:size-6" asChild>
                        <RegisterLink
                          authUrlParams={{
                            connection_id: connection.id,
                          }}
                        >
                          <AuthProviderIcon strategy={connection.strategy} />
                        </RegisterLink>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="min-w-0">
                      <Card>
                        <CardBody className="px-2 py-1 text-center text-sm">{connection.display_name}</CardBody>
                      </Card>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
