import AvatarWithBadge from "@/components/avatar-with-badge";
import type { Theme } from "@/components/theme-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { UserType } from "@/types/auth.type";
import { useState } from "react";

interface Props {
  user: UserType;
  theme: Theme;
}

const MessageStatusPopover = ({ user, theme }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover key={user._id} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseOver={() => setIsOpen(true)}
          onMouseOut={() => setIsOpen(false)}
        >
          <AvatarWithBadge
            name={user?.name || "unknown"}
            size="w-4 h-4"
            src={user?.avatar || ""}
            isOnline={false}
            className={theme === "dark" ? "bg-accent" : "bg-white"}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="start" className="z-99999 w-fit p-1">
        <p className="text-xs">{user.name}</p>
      </PopoverContent>
    </Popover>
  );
};

export default MessageStatusPopover;
