import { useAuth } from "@/hooks/use-auth";
import type { MessageType } from "@/types/chat.types";
import ChatUserMessage from "./chat-user-message";
import SystemMessage from "./system-message";

interface Props {
  message: MessageType;
  onReply: (message: MessageType) => void;
  onEdit: (message: MessageType) => void;
  onDelete: (message: string) => void;
}

const ChatBodyMessage = ({ message, onReply, onEdit, onDelete }: Props) => {
  const { user } = useAuth();

  const SYSTEM_ID = import.meta.env.VITE_SYSTEM_USER_ID;

  return (
    <>
      {message.sender?._id !== SYSTEM_ID && (
        <ChatUserMessage
          user={user}
          message={message}
          onEdit={onEdit}
          onReply={onReply}
          onDelete={onDelete}
        />
      )}

      {message.sender?._id === SYSTEM_ID && <SystemMessage message={message} />}
    </>
  );
};

export default ChatBodyMessage;
