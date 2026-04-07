import MessageHeader from "./message-header";
import type { MessageType } from "@/types/chat.types";
import { useChat } from "@/hooks/use-chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangleIcon } from "lucide-react";

interface Props {
  message: MessageType;
}

const UnknownUserMessage = ({ message }: Props) => {
  const { singleChat } = useChat();

  if (!singleChat) return null;

  return (
    <div className="group flex gap-2 py-3 px-4">
      <div className="shrink-0 flex items-start">
        <div className="relative shrink-0">
          <Avatar className="w-9 h-9">
            <AvatarFallback
              className="bg-accent text-primary font-semibold flex items-center justify-center
          "
            >
              <AlertTriangleIcon size={20} className="text-destructive" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="max-w-[70%] flex flex-col relative">
        <div className="flex items-center gap-1">
          <div className="min-w-50 max-w-100 px-3 py-2 text-sm wrap-break-words shadow-sm bg-[#F5F5F5] dark:bg-accent rounded-bl-xl rounded-r-xl">
            <MessageHeader message={message} user={null} />
            <p className="text-destructive">{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnknownUserMessage;
