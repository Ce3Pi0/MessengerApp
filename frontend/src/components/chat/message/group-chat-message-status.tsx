import { useTheme } from "@/components/theme-provider";
import type { MessageType } from "@/types/chat.types";
import MessageStatusPopover from "./message-status-popover";

interface Props {
  message: MessageType;
  nextMessage: MessageType | null;
}

const GroupChatMessageStatus = ({ message, nextMessage }: Props) => {
  const { theme } = useTheme();
  const { readBy } = message;

  return (
    <div className="flex max-w-50 flex-wrap">
      {readBy
        .filter((u) => !nextMessage?.readBy.find((nu) => nu._id === u._id))
        .map((u) => (
          <MessageStatusPopover key={u._id} user={u} theme={theme} />
        ))}
    </div>
  );
};

export default GroupChatMessageStatus;
