import ChatBody from "@/components/chat/chat-body";
import ChatFooter from "@/components/chat/chat-footer";
import ChatHeader from "@/components/chat/chat-header";
import EmptyState from "@/components/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import useChatId from "@/hooks/use-chat-id";
import { useSocket } from "@/hooks/use-socket";
import type { MessageType } from "@/types/chat.types";
import { useEffect, useRef, useState } from "react";

const SingleChat = () => {
  const chatId = useChatId();
  const {
    fetchSingleChat,
    isSingleChatLoading,
    singleChat,
    gettingMoreMessages,
    fetchExtraMessages,
  } = useChat();
  const { socket } = useSocket();
  const { user } = useAuth();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const [editMessage, setEditMessage] = useState<MessageType | null>(null);
  const [messageIdToDelete, setMessageIdToDelete] = useState<string | null>(
    null,
  );
  const [scrollHeight, setScrollHeight] = useState(0);

  const currentUserId = user?._id || null;
  const chat = singleChat?.chat;
  const messages = singleChat?.messages || [];

  useEffect(() => {
    if (!chatId) return;
    fetchSingleChat(chatId);
  }, [fetchSingleChat, chatId]);

  useEffect(() => {
    if (!chatId || !socket) return;

    socket.emit("chat:join", chatId);

    return () => {
      socket.emit("chat:leave", chatId);
    };
  }, [chatId, socket]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.scrollTop === 0 && chatId && !gettingMoreMessages) {
      setScrollHeight(container.scrollHeight);
      fetchExtraMessages(chatId);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current && scrollHeight > 0) {
      const container = scrollContainerRef.current;
      const addedHeight = container.scrollHeight - scrollHeight;
      container.scrollTop = addedHeight;
      setScrollHeight(0);
    }
  }, [messages]);

  if (isSingleChatLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="w-11 h-11 text-primary!" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="relative h-svh flex flex-col">
      <ChatHeader chat={chat} currentUserId={currentUserId} />
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-background"
        onScroll={handleScroll}
      >
        {gettingMoreMessages && (
          <div className="flex items-center justify-center p-2">
            <Spinner className="w-11 h-11 text-primary!" />
          </div>
        )}
        {messages.length === 0 ? (
          <EmptyState
            title="Start a conversation"
            description="No messages yet. Send the first message"
          />
        ) : (
          <ChatBody
            chatId={chatId}
            messages={messages}
            onReply={setReplyTo}
            onEdit={setEditMessage}
            onDelete={setMessageIdToDelete}
          />
        )}
      </div>
      <ChatFooter
        replyTo={replyTo}
        editMessage={editMessage}
        chatId={chatId}
        currentUserId={currentUserId}
        onCancelReply={() => setReplyTo(null)}
        onCancelEdit={() => setEditMessage(null)}
      />
    </div>
  );
};

export default SingleChat;
