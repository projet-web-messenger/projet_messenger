import { Link } from "@/components/ui/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Card } from "@repo/ui/data-display/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/disclosure/tabs";
import { Button, IconButton } from "@repo/ui/form/button";
import { LinkBox, LinkOverlay } from "@repo/ui/navigation/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/overlay/tooltip";
import { redirect } from "next/navigation";
import { LuCirclePlus } from "react-icons/lu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}

      <Tabs defaultValue="private-messages" orientation="vertical" className="flex flex-1">
        <TabsList className="flex w-16 flex-col bg-gray-200 p-2 dark:bg-gray-800">
          {/* Private Messages */}
          <Tooltip positioning={{ side: "right", align: "center" }}>
            <TooltipTrigger asChild>
              <TabsTrigger value="private-messages" asChild>
                <Button variant="ghost" asChild>
                  <LinkBox className="mb-3 flex size-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg dark:from-purple-600 dark:to-pink-600">
                    <LinkOverlay asChild>
                      <Link href="/app/@me" className="font-bold text-md text-white sm:text-2xl">
                        M
                      </Link>
                    </LinkOverlay>
                  </LinkBox>
                </Button>
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="w-auto min-w-0">
              <Card className="g-white border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                <p className="px-2 py-1 text-center text-gray-900 text-xs sm:text-sm dark:text-gray-100">Private messages</p>
              </Card>
            </TooltipContent>
          </Tooltip>

          {/* Add New Channel Button */}
          <Tooltip positioning={{ side: "right", align: "center" }}>
            <TooltipTrigger asChild>
              <IconButton icon={<LuCirclePlus />} variant="plain" className="rounded-lg hover:bg-blue-500" size="sm" />
            </TooltipTrigger>
            <TooltipContent className="w-auto min-w-0">
              <Card className="g-white border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                <p className="px-2 py-1 text-center text-gray-900 text-xs sm:text-sm dark:text-gray-100">Add new channel</p>
              </Card>
            </TooltipContent>
          </Tooltip>
        </TabsList>
        <TabsContent value="private-messages" className="flex-1 bg-white p-0 dark:bg-gray-900">
          {children}
        </TabsContent>
      </Tabs>
      {/* 
      <aside className="w-60 lg:w-72 bg-gray-200 dark:bg-gray-800 flex flex-col">
        <AppSidebar />
        <UserPanel />
      </aside> */}

      {/* Main Content with Tabs */}
      {/* <main className="flex-1 flex flex-col min-w-0">
        <AppTabs />
      </main> */}
    </div>
  );
}
