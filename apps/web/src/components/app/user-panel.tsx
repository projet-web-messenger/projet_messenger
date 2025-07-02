import { Button } from "@repo/ui/form/button";
import { Avatar } from "@repo/ui/media/avatar";
import { Icon } from "@repo/ui/media/icon";
import { LuHeadphones, LuMic, LuSettings } from "react-icons/lu";

export function UserPanel() {
  return (
    <div className="border-gray-400 border-t bg-gray-300 p-3 dark:border-gray-600 dark:bg-gray-750">
      <div className="flex items-center gap-2">
        <Avatar src="/user-me.png" fallback="ME" size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-gray-900 text-sm dark:text-white">Your Name</div>
          <div className="text-gray-600 text-xs dark:text-gray-400">Online</div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Icon as={LuMic} className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Icon as={LuHeadphones} className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Icon as={LuSettings} className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
