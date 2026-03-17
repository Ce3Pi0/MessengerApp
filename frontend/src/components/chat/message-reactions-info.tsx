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
import { useState } from "react";

interface Props {
  isCurrentUser: boolean;
  reactionsData: ReactionDataType[];
}

const MessageReactionsInfo = ({ isCurrentUser, reactionsData }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const MAX_EMOJIS_SHOWN: number = 5;

  const handleRemoveReaction = (reactionData: ReactionDataType) => {
    //TODO:  Implement Handle Remove in Backend
    console.log("removing reaction: ", reactionData);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex flex-wrap gap-1 mt-1",
            isCurrentUser ? "justify-end" : "justify-start",
          )}
        >
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded-full shadow-sm">
            {reactionsData
              .slice(0, MAX_EMOJIS_SHOWN)
              .map((reactionData, index) => (
                <span
                  key={index}
                  className="text-sm leading-none cursor-default"
                >
                  {reactionData.emoji}
                </span>
              ))}
            {/* Optional: Add a count if you have more than one person reacting */}
            <span className="text-[10px] font-medium text-muted-foreground ml-0.5">
              {reactionsData.length > MAX_EMOJIS_SHOWN &&
                reactionsData.length - MAX_EMOJIS_SHOWN}
            </span>
          </div>
        </div>
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
        {reactionsData.map((reactionData, index) => {
          return (
            <div className="flex flex-row justify-between p-1">
              <div className="flex flex-row gap-2">
                <AvatarWithBadge
                  name={reactionData?.reactor.name}
                  src={reactionData?.reactor.avatar}
                />
                <div className="flex flex-col justify-center items-start">
                  {isCurrentUser ? "You" : reactionData?.reactor.name}
                  {isCurrentUser && (
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
                {reactionsData[index].emoji}
              </div>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

export default MessageReactionsInfo;
