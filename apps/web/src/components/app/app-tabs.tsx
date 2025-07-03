"use client";

import { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger } from "@repo/ui/disclosure/tabs";
import { Button } from "@repo/ui/form/button";
import { Icon } from "@repo/ui/media/icon";
import { useState } from "react";
import { LuMessageSquare, LuPlus, LuServer, LuSettings, LuUsers, LuX } from "react-icons/lu";
import { FriendsArea } from "./friends-area";
import { MessageArea } from "./message-area";
import { ServerArea } from "./server-area";

type TabData = {
  id: string;
  label: string;
  icon: React.ElementType;
  content: React.ReactNode;
  closable?: boolean;
};

export function AppTabs() {
  const [tabs, setTabs] = useState<TabData[]>([
    {
      id: "messages",
      label: "Messages",
      icon: LuMessageSquare,
      content: <MessageArea />,
      closable: false,
    },
    {
      id: "friends",
      label: "Friends",
      icon: LuUsers,
      content: <FriendsArea />,
      closable: false,
    },
    {
      id: "servers",
      label: "Servers",
      icon: LuServer,
      content: <ServerArea />,
      closable: false,
    },
  ]);

  const [activeTab, setActiveTab] = useState("messages");

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    // If closing active tab, switch to first available tab
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  const addNewTab = () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: TabData = {
      id: newTabId,
      label: "New Chat",
      icon: LuMessageSquare,
      content: <MessageArea />,
      closable: true,
    };

    setTabs([...tabs, newTab]);
    setActiveTab(newTabId);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} variant="outline" className="flex h-full flex-col">
      {/* Tab Headers */}
      <div className="border-gray-200 border-b bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center">
          <TabsList className="h-12 flex-1 justify-start rounded-none bg-transparent shadow-none">
            <TabsIndicator />
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="group relative h-12 rounded-none border-0 px-4 transition-colors hover:bg-gray-50 data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:hover:bg-gray-700/50"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Icon
                    as={tab.icon}
                    className="h-4 w-4 flex-shrink-0 text-gray-500 group-aria-[selected=true]:text-purple-600 dark:text-gray-400 dark:group-aria-[selected=true]:text-purple-400"
                  />
                  <span className="truncate font-medium text-gray-700 text-sm group-aria-[selected=true]:text-gray-900 dark:text-gray-300 dark:group-aria-[selected=true]:text-white">
                    {tab.label}
                  </span>
                  {tab.closable && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-1 h-4 w-4 p-0 opacity-0 transition-opacity hover:bg-gray-200 group-hover:opacity-100 dark:hover:bg-gray-600"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                    >
                      <Icon as={LuX} className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Add New Tab Button */}
          <div className="px-2">
            <Button size="sm" variant="ghost" onClick={addNewTab} className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Icon as={LuPlus} className="h-4 w-4" />
            </Button>
          </div>

          {/* Settings Button */}
          <div className="border-gray-200 border-l px-2 dark:border-gray-700">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Icon as={LuSettings} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-0 flex-1">
        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className="data-[state=inactive]:fade-out-0 data-[state=active]:fade-in-0 h-full data-[state=active]:animate-in data-[state=inactive]:animate-out"
          >
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
