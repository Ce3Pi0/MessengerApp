//TODO: Modularize

import ChatBody from "@/components/chat/chat-body";
import ChatFooter from "@/components/chat/chat-footer";
import ChatHeader from "@/components/chat/chat-header";
import { useTheme } from "@/components/theme-provider";
import EmptyState from "@/components/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import useChatId from "@/hooks/use-chat-id";
import { useSocket } from "@/hooks/use-socket";
import type { UserType } from "@/types/auth.type";
import type { MessageType } from "@/types/chat.types";
import { useEffect, useRef, useState } from "react";
import wpDark from "@/assets/wp.png";
import wpLight from "@/assets/wp-white.png";

const SingleChat = () => {
  const chatId = useChatId();
  const {
    fetchSingleChat,
    isSingleChatLoading,
    singleChat,
    gettingMoreMessages,
    fetchExtraMessages,
    sendDeleteMessage,
    addNewMessage,
    sendReadNewMessage,
    blockUser,
    unblockUser,
  } = useChat();
  const { socket } = useSocket();
  const { user } = useAuth();
  const { theme } = useTheme();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const [editMessage, setEditMessage] = useState<MessageType | null>(null);
  const [messageIdToDelete, setMessageIdToDelete] = useState<string | null>(
    null,
  );
  const [scrollHeight, setScrollHeight] = useState(0);

  const currentUserId = user?._id || null;
  const chat = singleChat?.chat;
  const messages = useChat((state) => state.singleChat?.messages) || [];
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const backgroundImage = chat?.background || (isDarkMode ? wpDark : wpLight);
  const isAiChat = chat?.isAiChat || false;

  useEffect(() => {
    if (!chatId) return;
    fetchSingleChat(chatId);
  }, [fetchSingleChat, chatId]);

  useEffect(() => {
    if (!chatId || !socket) return;

    socket.emit("chat:join", chatId, (err?: string) => {
      if (err) {
        console.error("Failed to join chat:", err);
      } else {
        console.log("Joined chat room:", chatId);
      }
    });

    return () => {
      socket.emit("chat:leave", chatId);
    };
  }, [chatId, socket]);

  useEffect(() => {
    if (!chatId || !socket) return;

    const handleNewMessage = (msg: MessageType) => {
      addNewMessage(chatId, msg);
      sendReadNewMessage(chatId, msg._id);
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, chatId, addNewMessage]);

  useEffect(() => {
    if (!chatId || !socket) return;

    const handleBlockUser = (userId: string) => {
      blockUser(userId);
    };

    socket.on("user:blocked", handleBlockUser);

    return () => {
      socket.off("user:blocked", handleBlockUser);
    };
  }, [socket, chatId, blockUser]);

  useEffect(() => {
    if (!chatId || !socket) return;

    const handleUnblockUser = (user: UserType) => {
      unblockUser(user);
    };

    socket.on("user:unblocked", handleUnblockUser);

    return () => {
      socket.off("user:unblocked", handleUnblockUser);
    };
  }, [socket, chatId, blockUser]);

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

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "instant",
    });
  }, [isSingleChatLoading]);
  const handleDeleteConfirm = () => {
    if (!chatId || !messageIdToDelete) return;
    setMessageIdToDelete(null);
    sendDeleteMessage(chatId, messageIdToDelete);
  };

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
        className="flex-1 overflow-y-auto bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
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
        isAiChat={isAiChat}
        onCancelReply={() => setReplyTo(null)}
        onCancelEdit={() => setEditMessage(null)}
      />

      <AlertDialog
        open={!!messageIdToDelete}
        onOpenChange={(open) => !open && setMessageIdToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              message from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SingleChat;
