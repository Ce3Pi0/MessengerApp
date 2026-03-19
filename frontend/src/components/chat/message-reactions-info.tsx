import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../ui/popover";
import AvatarWithBadge from "../avatar-with-badge";
import type { ReactionDataType } from "@/types/chat.types";
import { useEffect, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { useSocket } from "@/hooks/use-socket";

interface Props {
  messageId: string;
  currentUserId?: string;
  isCurrentUser: boolean;
}

const MessageReactionsInfo = ({
  messageId,
  currentUserId,
  isCurrentUser,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { socket } = useSocket();
  const { singleChat, sendDeleteReaction, addNewReaction, deleteReaction } =
    useChat();

  const reactionsData =
    singleChat?.messages.find((m) => m._id === messageId)?.reactions ?? [];

  const MAX_EMOJIS_SHOWN: number = 5;
  const chatId = singleChat?.chat._id;

  const handleRemoveReaction = (reactionData: ReactionDataType) => {
    if (!singleChat) return;
    sendDeleteReaction(singleChat.chat._id, messageId, reactionData._id);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!chatId || !socket) return;

    const handleSetReaction = (
      reactionId: string,
      messageId: string,
      reactor: any,
      emoji: string,
    ) => {
      addNewReaction(reactionId, chatId, messageId, reactor, emoji);
    };

    socket.on("reaction:update", handleSetReaction);

    return () => {
      socket.off("reaction:update", handleSetReaction);
    };
  }, [socket, chatId]);

  useEffect(() => {
    if (!chatId || !socket) return;

    const handleDeleteReaction = (messageId: string, reactionId: string) => {
      deleteReaction(chatId, messageId, reactionId);
      if (reactionsData.length === 0) setIsOpen(false);
    };

    socket.on("reaction:delete", handleDeleteReaction);

    return () => {
      socket.off("reaction:delete", handleDeleteReaction);
    };
  }, [socket, chatId]);

  console.log(messageId, reactionsData);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {reactionsData.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-1 mt-1",
              isCurrentUser ? "justify-end" : "justify-start",
            )}
          >
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded-full shadow-sm">
              {reactionsData.slice(0, MAX_EMOJIS_SHOWN).map((reactionData) => (
                <span
                  key={reactionData._id}
                  className="text-sm leading-none cursor-default"
                >
                  {reactionData.emoji}
                </span>
              ))}
              <span className="text-[10px] font-medium text-muted-foreground ml-0.5">
                {reactionsData.length > MAX_EMOJIS_SHOWN &&
                  reactionsData.length - MAX_EMOJIS_SHOWN}
              </span>
            </div>
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="p-2 border-none shadow-none"
      >
        <PopoverHeader>
          <PopoverTitle>{reactionsData.length} Reactions</PopoverTitle>
          <hr />
        </PopoverHeader>
        {/* Sender avatar with badge and reaction */}
        {reactionsData.map((reactionData) => {
          return (
            <div
              className="flex flex-row justify-between p-1"
              key={reactionData._id}
            >
              <div className="flex flex-row gap-2">
                <AvatarWithBadge
                  name={reactionData?.reactor.name}
                  src={reactionData?.reactor.avatar}
                />
                <div className="flex flex-col justify-center items-start">
                  {currentUserId === reactionData?.reactor._id
                    ? "You"
                    : reactionData?.reactor.name}
                  {currentUserId === reactionData?.reactor._id && (
                    <a
                      onClick={() => handleRemoveReaction(reactionData)}
                      className="text-xs text-muted-foreground hover:cursor-pointer"
                    >
                      Tap to remove
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between items-center">
                {reactionData.emoji}
              </div>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

export default MessageReactionsInfo;
