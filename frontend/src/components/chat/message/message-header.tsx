import { formatChatTime } from "@/lib/helper";
import type { UserType } from "@/types/auth.type";
import type { MessageType } from "@/types/chat.types";

interface Props {
  message: MessageType;
  user: UserType | null;
}

const MessageHeader = ({ message, user }: Props) => {
  if (!user) return null;

  const isCurrentUser = message.sender?._id === user._id;

  const senderName = isCurrentUser ? "You" : message.sender?.name;

  return (
    <div className="flex items-center gap-2 mb-0.5 pb-1">
      <span className="text-xs font-semibold">{senderName}</span>
      <span className="text-[11px] text-gray-700 dark:text-gray-300">
        {formatChatTime(message?.createdAt)}
      </span>
    </div>
  );
};

export default MessageHeader;
