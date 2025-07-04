import { getConnections } from "@/actions/misc";
import { OAuthProviders } from "@/components/auth/oauth-providers";
import { PasswordlessForm } from "@/components/auth/passwordless-form";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@repo/ui/data-display/card";
import { Container } from "@repo/ui/layout/container";

export default async function LoginPage() {
  const connections = await getConnections();

  const passwordlessConnection = connections?.find((connection) => connection?.strategy === "email:otp");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-purple-50 via-gray-50 to-purple-100 dark:from-gray-950 dark:via-black dark:to-gray-900">
      <Container className="max-w-screen-md p-4 sm:p-6">
        {/* Main Card */}
        <Card className="relative w-full border border-gray-200/20 bg-white/95 shadow-2xl backdrop-blur-xl md:flex-row md:items-center dark:border-gray-700/50 dark:bg-gray-800/95">
          {/* Header */}
          <CardHeader className="px-4 pt-6 text-center sm:px-6 sm:pt-8">
            {/* Logo placeholder */}
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg sm:mb-6 sm:size-16 sm:rounded-2xl dark:from-purple-600 dark:to-pink-600">
              <span className="font-bold text-lg text-white sm:text-2xl">M</span>
            </div>
            <CardTitle as="h1" className="mb-2 font-bold text-gray-900 text-xl sm:text-2xl dark:text-white">
              Welcome back!
            </CardTitle>
            <CardDescription className="mx-auto max-w-xs text-gray-600 text-xs sm:max-w-sm sm:text-sm dark:text-gray-400">
              We're so excited to see you again!
            </CardDescription>
          </CardHeader>

          {/* Authentication Forms */}
          <CardBody className="gap-4 px-4 pb-6 sm:gap-6 sm:px-6 sm:pb-8">
            {/* Passwordless Authentication */}
            {passwordlessConnection ? (
              <PasswordlessForm connection_id={passwordlessConnection.id} />
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center sm:p-4 dark:border-red-800/30 dark:bg-red-900/20">
                <p className="text-red-600 text-xs sm:text-sm dark:text-red-400">Email login is currently unavailable</p>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-2 sm:gap-3">
              <hr className="flex-1 border-gray-300 border-t dark:border-gray-600" />
              <span className="px-1 text-2xs text-gray-500 uppercase tracking-wider sm:px-2 sm:text-xs dark:text-gray-400">Or continue with</span>
              <hr className="flex-1 border-gray-300 border-t dark:border-gray-600" />
            </div>

            {/* OAuth2 Providers */}
            <OAuthProviders />
          </CardBody>

          {/* Floating elements for visual appeal - hidden on small screens */}
          <div className="-top-4 -left-4 absolute hidden h-16 w-16 rounded-full bg-purple-500/10 blur-xl sm:block sm:h-24 sm:w-24 dark:bg-purple-500/20" />
          <div className="-bottom-4 -right-4 absolute hidden h-20 w-20 rounded-full bg-pink-500/10 blur-xl sm:block sm:h-32 sm:w-32 dark:bg-pink-500/20" />
        </Card>
      </Container>
    </div>
  );
}
