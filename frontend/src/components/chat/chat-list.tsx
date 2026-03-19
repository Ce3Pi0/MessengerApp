import { useChat } from "@/hooks/use-chat";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "../ui/spinner";
import ChatListItem from "./chat-list-item";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import ChatListHeader from "./chat-list-header";
import { useSocket } from "@/hooks/use-socket";
import type {
  ChatType,
  MessageType,
  ReactionDataType,
} from "@/types/chat.types";

const ChatList = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const {
    fetchChats,
    chats,
    isChatLoading,
    addNewChat,
    updateChatLastInfo,
    gettingMoreChats,
    fetchExtraChats,
  } = useChat();

  const { user } = useAuth();
  const currentUserId = user?._id || null;

  const [searchQuery, setSearchQuery] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState(0);

  const filterChats = chats?.filter(
    (chat) =>
      chat.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participants?.some(
        (p) =>
          p._id !== currentUserId &&
          p.name.toLowerCase().includes(searchQuery.toLocaleLowerCase()),
      ),
  );

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (!socket) return;

    const handleNewChat = (newChat: ChatType) => {
      addNewChat(newChat);
    };

    socket.on("chat:new", handleNewChat);

    return () => {
      socket.off("chat:new", handleNewChat);
    };
  }, [addNewChat, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleChatUpdate = (data: {
      chatId: string;
      lastMessage: MessageType | null;
      lastReaction: ReactionDataType | null;
    }) => {
      updateChatLastInfo(data.chatId, data.lastMessage, data.lastReaction);
    };

    socket.on("chat:update", handleChatUpdate);

    return () => {
      socket.off("chat:update", handleChatUpdate);
    };
  }, [socket, updateChatLastInfo]);

  const onRoute = (id: string) => {
    navigate(`/chat/${id}`);
  };

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, clientHeight, scrollHeight } = container;

    const isAtBottom = scrollHeight - clientHeight <= scrollTop + 1;
    if (isAtBottom) {
      setScrollHeight(0);
      fetchExtraChats();
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current && scrollHeight > 0) {
      const container = scrollContainerRef.current;
      const addedHeight = container.scrollHeight - scrollHeight;
      container.scrollTop = addedHeight;
    }
  }, [filterChats]);

  return (
    <div className="fixed inset-y-0 pb-20 lg:pb-0 lg:max-w-94.75 lg:block border-r border-border bg-sidebar max-w-[calc(100%-40px)] w-full left-10 z-98">
      <div className="flex-col">
        <ChatListHeader onSearch={setSearchQuery} />
        <div
          className="flex-1 h-[calc(100vh-100px)] overflow-y-auto"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <div className="px-2 pb-10 pt-1 space-y-1">
            {isChatLoading ? (
              <div className="flex items-center justify-center">
                <Spinner className="w-7 h-7" />
              </div>
            ) : filterChats?.length === 0 ? (
              <div className="flex items-center justify-center">
                {searchQuery ? "No chat found" : "No chats created"}
              </div>
            ) : (
              filterChats?.map((chat) => (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  currentUserId={currentUserId}
                  onClick={() => onRoute(chat._id)}
                />
              ))
            )}
            {gettingMoreChats && (
              <div className="flex items-center justify-center p-2">
                <Spinner className="w-5 h-5 text-primary!" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
