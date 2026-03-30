import { useChat } from "@/hooks/use-chat";
import { useSocket } from "@/hooks/use-socket";
import type { MessageType } from "@/types/chat.types";
import { useEffect, useRef } from "react";
import ChatBodyMessage from "./message/chat-body-message";

interface Props {
  chatId: string | null;
  messages: MessageType[];
  onReply: (message: MessageType) => void;
  onEdit: (message: MessageType) => void;
  onDelete: (messageId: string) => void;
}

const ChatBody = ({ chatId, messages, onReply, onEdit, onDelete }: Props) => {
  const { socket } = useSocket();
  const { editMessage, deleteMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const prevLastMessageIdRef = useRef<string | null>(
    messages[messages.length - 1]?._id || null,
  );

  useEffect(() => {
    const currentLastMessageId = messages[messages.length - 1]?._id || null;

    if (
      currentLastMessageId &&
      prevLastMessageIdRef.current &&
      currentLastMessageId !== prevLastMessageIdRef.current
    ) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }

    prevLastMessageIdRef.current = currentLastMessageId;
  }, [messages]);

  useEffect(() => {
    if (!chatId || !socket) return;

    const handleEditMessage = (msg: MessageType) => {
      editMessage(chatId, msg);
    };

    socket.on("message:update", handleEditMessage);

    return () => {
      socket.off("message:update", handleEditMessage);
    };
  }, [socket, chatId, editMessage]);

  useEffect(() => {
    if (!chatId || !socket) return;

    const handleDeleteMessage = (msgId: string) => {
      deleteMessage(chatId, msgId);
    };

    socket.on("message:delete", handleDeleteMessage);
    return () => {
      socket.off("message:delete", handleDeleteMessage);
    };
  }, [socket, chatId, deleteMessage]);

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-auto w-full min-h-full">
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col px-3">
          {messages.map((message, index) => (
            <ChatBodyMessage
              key={message._id}
              message={message}
              nextMessage={messages[index + 1] ?? null}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
        <br />

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatBody;
