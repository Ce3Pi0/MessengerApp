import { cn } from "@/lib/utils";
import type { UserType } from "@/types/auth.type";
import type { MessageType } from "@/types/chat.types";

interface Props {
  isCurrentUser: boolean;
  message: MessageType;
  user: UserType | null;
}

const ReplyToBox = ({ isCurrentUser, message, user }: Props) => {
  if (!user) return null;

  const replyBoxClass = cn(
    "mb-2 p-2 text-xs rounded-md border-l-4 shadow-md !text-left",
    isCurrentUser
      ? "bg-primary/20 border-l-primary"
      : "bg-gray-200 dark:bg-secondary border-l-[#CC4A31]",
  );

  const replySenderName =
    message.replyTo?.sender?._id === user._id
      ? "You"
      : message.replyTo?.sender?.name;

  return (
    <div className={replyBoxClass}>
      <h5 className="font-medium">{replySenderName}</h5>
      <p className="font-normal text-muted-foreground">
        {message?.replyTo?.image ? "📷 Photo" : message?.replyTo?.content}
      </p>
    </div>
  );
};

export default ReplyToBox;
