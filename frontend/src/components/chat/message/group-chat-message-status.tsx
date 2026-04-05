import { useTheme } from "@/components/theme-provider";
import type { MessageType } from "@/types/chat.types";
import MessageStatusPopover from "./message-status-popover";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  message: MessageType;
  nextMessage: MessageType | null;
}

const GroupChatMessageStatus = ({ message, nextMessage }: Props) => {
  const { theme } = useTheme();
  const { readBy } = message;
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex max-w-50 flex-wrap">
      {readBy
        .filter(
          (u) =>
            !nextMessage?.readBy.find((nu) => nu._id === u._id) &&
            u._id !== user._id,
        )
        .map((u) => (
          <MessageStatusPopover key={u._id} user={u} theme={theme} />
        ))}
    </div>
  );
};

export default GroupChatMessageStatus;
