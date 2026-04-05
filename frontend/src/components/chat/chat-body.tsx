import { useChat } from "@/hooks/use-chat";
import { useSocket } from "@/hooks/use-socket";
import type { MessageType } from "@/types/chat.types";
import { useEffect, useRef, useState } from "react";
import ChatBodyMessage from "./message/chat-body-message";
import type { UserType } from "@/types/auth.type";
import TypingIndicator from "./typing-indicator";
import AvatarWithBadge from "../avatar-with-badge";

interface Props {
  chatId: string | null;
  messages: MessageType[];
  onReply: (message: MessageType) => void;
  onEdit: (message: MessageType) => void;
  onDelete: (messageId: string) => void;
}

const ChatBody = ({ chatId, messages, onReply, onEdit, onDelete }: Props) => {
  const { socket } = useSocket();
  const { editMessage, deleteMessage, addOrUpdateMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const prevLastMessageIdRef = useRef<string | null>(
    messages[messages.length - 1]?._id || null,
  );
  const [_, setAiChunk] = useState<string>("");

  const [typingUsers, setTypingUsers] = useState<UserType[]>([]);
  const visibleTypingUsers = typingUsers.slice(0, 3);
  const hiddenTypingUsersCount = typingUsers.length - visibleTypingUsers.length;

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

      setTypingUsers([]);
    }

    prevLastMessageIdRef.current = currentLastMessageId;
  }, [messages]);

  useEffect(() => {
    if (!chatId || !socket) return;

    const handleUserTyping = (user: UserType) => {
      setTypingUsers((prevTypingUsers) => {
        if (prevTypingUsers.some((u) => u._id === user._id)) {
          return prevTypingUsers;
        }

        return [...prevTypingUsers, user];
      });
    };

    socket.on("typing", handleUserTyping);

    return () => {
      socket.off("typing", handleUserTyping);
    };
  }, [socket, chatId]);

  useEffect(() => {
    if (!chatId || !socket) return;

    const handleUserStoppedTyping = (user: UserType) => {
      setTypingUsers((prevTypingUsers) =>
        prevTypingUsers.filter((u) => u._id !== user._id),
      );
    };

    socket.on("stopped-typing", handleUserStoppedTyping);

    return () => {
      socket.off("stopped-typing", handleUserStoppedTyping);
    };
  }, [socket, chatId]);

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

  useEffect(() => {
    if (!socket || !chatId) return;

    const handleAiStream = ({
      chatId: streamChatId,
      chunk,
      done,
    }: {
      chatId: string;
      chunk: string | null;
      done: boolean;
      message: MessageType | null;
    }) => {
      if (streamChatId !== chatId) return;

      const lastMessage = messages.at(-1);
      if (!lastMessage?._id && lastMessage?.streaming) return;

      if (chunk?.trim() && !done) {
        setAiChunk((prev) => {
          const newContent = prev + chunk;
          addOrUpdateMessage(
            chatId,
            {
              ...lastMessage,
              content: newContent,
            } as MessageType,
            lastMessage?._id,
          );
          return newContent;
        });
        return;
      }

      if (done) {
        setAiChunk("");
      }
    };

    socket.on("chat:ai", handleAiStream);

    return () => {
      socket.off("chat:ai", handleAiStream);
    };
  }, [addOrUpdateMessage, chatId, messages, socket]);

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

          {typingUsers.length > 0 && (
            <div className="flex items-center gap-3 px-4">
              <div className="flex items-center -space-x-3">
                {visibleTypingUsers.map((u, index) => (
                  <div
                    className="rounded-full"
                    key={u._id}
                    style={{ zIndex: visibleTypingUsers.length - index }}
                  >
                    <AvatarWithBadge name={u.name} src={u.avatar} />
                  </div>
                ))}
                {hiddenTypingUsersCount > 0 && (
                  <div className="z-0 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    +{hiddenTypingUsersCount}
                  </div>
                )}
              </div>
              <TypingIndicator />
            </div>
          )}
        </div>
        <br />

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatBody;
