import { cn } from "@/lib/utils";
import type { MessageType } from "@/types/chat.types";
import { Check, CheckCheck } from "lucide-react";

interface Props {
  message: MessageType;
}

function SingleChatMessageStatus({ message }: Props) {
  const isSending = message.status === "sending";

  const checkClass = cn(
    message.readBy.length > 0 ? "text-success" : "text-white",
  );

  return (
    <div>
      {!isSending && <CheckCheck size={14} className={checkClass} />}
      {isSending && <Check size={14} className="text-white" />}
    </div>
  );
}

export default SingleChatMessageStatus;
