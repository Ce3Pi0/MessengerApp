import { useAuth } from "@/hooks/use-auth";
import { formatChatTime, getOtherUserAndGroup } from "@/lib/helper";
import { cn } from "@/lib/utils";
import type { ChatType } from "@/types/chat.types";
import { useLocation } from "react-router-dom";
import AvatarWithBadge from "../avatar-with-badge";

interface Props {
  chat: ChatType;
  currentUserId: string | null;
  onClick?: () => void;
}

const ChatListItem = ({ chat, currentUserId, onClick }: Props) => {
  const { pathname } = useLocation();

  const { lastMessage, createdAt } = chat;

  const { name, avatar, isOnline, isGroup } = getOtherUserAndGroup(
    chat,
    currentUserId,
  );

  const getLastMessageText = () => {
    if (!lastMessage)
      return isGroup
        ? chat.createdBy === currentUserId
          ? "Group created"
          : "You were added"
        : "Send a message";

    if (isGroup && lastMessage.image && lastMessage.sender)
      return `${lastMessage.sender._id === currentUserId ? "You" : lastMessage.sender}: sent a 📷 photo`;
    if (isGroup && lastMessage.sender)
      return `${lastMessage.sender._id === currentUserId ? "You" : lastMessage.sender}: ${lastMessage.content}`;

    return lastMessage.content ? lastMessage.content : "📷 Photo";
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        `w-full flex items-center gap-2 p-2 rounded-sm hover:bg-sidebar-accent transition-colors text-left`,
        pathname.includes(chat._id) && "bg-sidebar-accent!",
      )}
    >
      <AvatarWithBadge
        name={name}
        src={avatar}
        isGroup={isGroup}
        isOnline={isOnline}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h5 className="text-sm font-semibold truncate">{name}</h5>
        </div>
        <span className="text-xs ml-2 shrink-0 text-muted-foreground">
          {formatChatTime(lastMessage?.updatedAt || createdAt)}
        </span>
      </div>
      <p className="text-xs truncate text-muted-foreground -mt-px">
        {getLastMessageText()}
      </p>
    </button>
  );
};

export default ChatListItem;
