export default function MessagesPage() {
  return (
    <div className="flex h-full">
      {/* Channel List */}
      <div className="w-60 border-r">{/* <ChannelList /> */}</div>

      {/* Message Area */}
      <div className="flex flex-1 flex-col">{/* <MessageArea /> */}</div>

      {/* Members List */}
      <div className="hidden w-60 border-gray-200 border-l bg-gray-50 xl:block dark:border-gray-700 dark:bg-gray-850">{/* <MembersList /> */}</div>
    </div>
    // <Tabs orientation="vertical" className="flex h-full">
    //   <ChannelList />
    //   <TabsContent>
    //     {children}
    //   </TabsContent>
    // </Tabs>
  );
}
