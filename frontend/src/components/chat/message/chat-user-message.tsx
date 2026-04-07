import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { MessageType } from "@/types/chat.types";
import AvatarWithBadge from "../../avatar-with-badge";
import { cn } from "@/lib/utils";
import MessageReaction from "./message-reaction";
import { Button } from "../../ui/button";
import { Copy, Edit2Icon, ReplyIcon, Trash2 } from "lucide-react";
import MessageReactionsInfo from "./message-reactions-info";
import type { UserType } from "@/types/auth.type";
import CopyToClipboard from "react-copy-to-clipboard";
import { useState } from "react";
import ReplyToBox from "./reply-to-box";
import MessageHeader from "./message-header";
import MessageStatus from "./message-status";
import GroupChatMessageStatus from "./group-chat-message-status";
import { useChat } from "@/hooks/use-chat";
import TypingIndicator from "../typing-indicator";
import UnknownUserMessage from "./unknown-user-message";

interface Props {
  user: UserType | null;
  message: MessageType;
  nextMessage: MessageType | null;
  onEdit: (message: MessageType) => void;
  onReply: (message: MessageType) => void;
  onDelete: (messageId: string) => void;
}

const ChatUserMessage = ({
  message,
  nextMessage,
  user,
  onEdit,
  onReply,
  onDelete,
}: Props) => {
  if (!user) return null;

  const isCurrentUser = message.sender?._id === user._id;

  const { singleChat } = useChat();

  if (!singleChat) return null;

  const isAiChat = singleChat.chat.isAiChat;

  const containerClass = cn(
    "group flex gap-2 py-3 px-4",
    isCurrentUser && "flex-row-reverse text-left",
  );

  const contentWrapperClass = cn(
    "max-w-[70%] flex flex-col relative",
    isCurrentUser && "items-end",
  );

  const messageClass = cn(
    "min-w-50 max-w-100 px-3 py-2 text-sm break-words shadow-sm",
    isCurrentUser
      ? "bg-accent dark:bg-primary/40 rounded-tr-xl rounded-l-xl"
      : "bg-[#F5F5F5] dark:bg-accent rounded-bl-xl rounded-r-xl",
  );

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const isUnknownUser = message.sender === null || message.sender === undefined;

  return (
    <>
      {isUnknownUser ? (
        <UnknownUserMessage message={message} />
      ) : (
        <div className={containerClass}>
          {!isCurrentUser && (
            <div className="shrink-0 flex items-start">
              <AvatarWithBadge
                name={message.sender?.name || "Unknown"}
                src={message.sender?.avatar || ""}
              />
            </div>
          )}

          <div className={contentWrapperClass}>
            <div
              className={cn(
                "flex items-center gap-1",
                isCurrentUser && "flex-row-reverse",
              )}
            >
              <div className={messageClass}>
                {/* {Header} */}
                <MessageHeader message={message} user={user} />
                {message.replyTo && (
                  <ReplyToBox
                    isCurrentUser={isCurrentUser}
                    message={message}
                    user={user}
                  />
                )}

                {message?.image && (
                  <img
                    src={message?.image || ""}
                    alt=""
                    className="lg:max-w-xs w-full h-auto max-w-full block object-cover rounded-md"
                  />
                )}

                {message.content && (
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code(props) {
                        const { children, className } = props;
                        const isBlock = className?.includes("language-");

                        if (isBlock) {
                          return (
                            <pre className="overflow-x-auto rounded-md bg-zinc-950 p-4 text-zinc-100">
                              <code className={className}>{children}</code>
                            </pre>
                          );
                        }

                        return (
                          <code className="rounded bg-muted px-1 py-0.5 text-sm">
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </Markdown>
                )}
                {isCurrentUser && !isAiChat && (
                  <MessageStatus message={message} />
                )}
                {message?.streaming && !message.content && <TypingIndicator />}
              </div>

              {/* Emoji Picker icon button */}
              {!isAiChat && (
                <MessageReaction
                  messageId={message._id}
                  isPickerOpen={isPickerOpen}
                  setIsPickerOpen={setIsPickerOpen}
                />
              )}

              {/* Reply button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => onReply(message)}
                className="flex opacity-0 group-hover:opacity-100 transition-opacity rounded-full size-8!"
              >
                <ReplyIcon
                  size={16}
                  className={cn(
                    "text-gray-500 dark:text-white stroke-[1.9]!",
                    isCurrentUser && "scale-x-[-1]",
                  )}
                />
              </Button>

              {/* Edit button */}
              {isCurrentUser && !isAiChat && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(message)}
                  className="flex opacity-0 group-hover:opacity-100 transition-opacity rounded-full size-8!"
                >
                  <Edit2Icon
                    size={16}
                    className="text-gray-500 dark:text-white stroke-[1.9]! scale-x-[-1]"
                  />
                </Button>
              )}

              {/* Delete button */}
              {isCurrentUser && !isAiChat && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(message._id)}
                  className="flex opacity-0 group-hover:opacity-100 transition-opacity rounded-full size-8!"
                >
                  <Trash2
                    size={16}
                    className="text-red-400 stroke-[1.9]! scale-x-[-1]"
                  />
                </Button>
              )}
            </div>
            <MessageReactionsInfo
              messageId={message._id}
              currentUserId={user?._id}
              isCurrentUser={isCurrentUser}
            />
            <CopyToClipboard
              text={
                message?.content ? message?.content : message.image?.toString()!
              }
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Copy size={14} />
              </Button>
            </CopyToClipboard>

            {singleChat?.chat.isGroup && (
              <GroupChatMessageStatus
                message={message}
                nextMessage={nextMessage}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatUserMessage;
