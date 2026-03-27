import { formatChatTime, getOtherUserAndGroup } from "@/lib/helper";
import { cn } from "@/lib/utils";
import type { ChatType } from "@/types/chat.types";
import { useLocation } from "react-router-dom";
import AvatarWithBadge from "../avatar-with-badge";
import { Star } from "lucide-react";

interface Props {
  isFavorite: boolean;
  chat: ChatType;
  currentUserId: string | null;
  onClick?: () => void;
}

const ChatListItem = ({ isFavorite, chat, currentUserId, onClick }: Props) => {
  const { pathname } = useLocation();

  const { lastMessage, lastReaction, createdAt } = chat;

  const { name, avatar, isOnline, isGroup } = getOtherUserAndGroup(
    chat,
    currentUserId,
  );

  const getLastInfoText = () => {
    if (!lastMessage && !lastReaction)
      return isGroup
        ? chat.createdBy === currentUserId
          ? "Group created"
          : "You were added"
        : "Send a message";

    if (lastMessage) {
      if (isGroup && lastMessage.image && lastMessage.sender)
        return `${lastMessage.sender._id === currentUserId ? "You" : lastMessage.sender.name}: sent a 📷 photo`;
      if (isGroup && lastMessage.sender)
        return `${lastMessage.sender._id === currentUserId ? "You" : lastMessage.sender.name}: ${lastMessage.content}`;

      const res: string = lastMessage.content
        ? lastMessage.content
        : "📷 Photo";
      return lastMessage.sender!._id === currentUserId
        ? `You: ${res}`
        : `${lastMessage.sender!.name}: ${res}`;
    } else if (lastReaction)
      return `${lastReaction.reactor._id === currentUserId ? "You" : lastReaction.reactor.name} reacted: ${lastReaction.emoji}`;
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
          {formatChatTime(
            lastMessage?.createdAt || lastReaction?.createdAt || createdAt,
          )}
        </span>
      </div>
      {isFavorite && <Star size={12} className="text-primary" />}
      <p className="text-xs truncate text-muted-foreground -mt-px">
        {getLastInfoText()}
      </p>
    </button>
  );
};

export default ChatListItem;
