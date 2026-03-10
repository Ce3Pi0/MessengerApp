import { useAuth } from "@/hooks/use-auth";
import { getOtherUserAndGroup } from "@/lib/helper";
import { cn } from "@/lib/utils";
import type { ChatType } from "@/types/chat.types";
import { useLocation } from "react-router-dom";

interface Props {
  chat: ChatType;
  onClick?: () => void;
}

const ChatListItem = ({ chat, onClick }: Props) => {
  const { pathname } = useLocation();

  const { lastMessage, createdAt } = chat;
  const { user } = useAuth();

  const currentUserId = user?._id || null;

  const { name, avatar, isOnline, isGroup } = getOtherUserAndGroup(
    chat,
    currentUserId,
  );

  return (
    <button
      onClick={onClick}
      className={cn(
        `w-full flex items-center gap-2 p-2 rounded-sm hover:bg-sidebar-accent transition-colors text-left`,
        pathname.includes(chat._id) && "bg-sidebar-accent!",
      )}
    ></button>
  );
};

export default ChatListItem;
