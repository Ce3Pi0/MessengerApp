import {
  BanIcon,
  DoorOpen,
  Image,
  Info,
  PencilLineIcon,
  Pin,
  PlusCircleIcon,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "../ui/popover";
import { useChat } from "@/hooks/use-chat";
import AvatarWithBadge from "../avatar-with-badge";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  openChatInfo: () => void;
}

const ChatInfoPopover = ({ openChatInfo }: Props) => {
  const { user } = useAuth();
  const { singleChat } = useChat();

  const isGroup = singleChat?.chat.isGroup;

  if (!singleChat) return null;

  const handlePinChat = () => {};

  const handleGroupNameChange = () => {};

  const handleGroupChangeBg = () => {};

  const handleDeleteChat = () => {};

  const handleBlockUser = () => {};

  const handleKickUser = () => {};

  const handleAddUser = () => {};

  const handleLeaveGroup = () => {};

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <div className="flex-1 text-center py-4 h-full font-medium text-accent-foreground hover:text-primary cursor-pointer">
            <Info size={24} onClick={() => openChatInfo()} />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="p-2 m-2 shadow-none z-9999"
      >
        <PopoverHeader className="pl-4 pb-2 pt-2">
          <h2 className="text-xl font-bold">Chat info</h2>
        </PopoverHeader>
        <hr />
        <>
          <div className="p-2">
            {isGroup && (
              <div className="p-2">
                <h5 className="text-zinc-400 text-xs">Group name:</h5>

                <div className="flex flex-row gap-2 items-center">
                  <h1>{singleChat?.chat.groupName}</h1>
                  {/* TODO: Check if user is group admin */}
                  <PencilLineIcon
                    size={16}
                    className="hover: cursor-pointer"
                    onClick={() => handleGroupNameChange}
                  />
                </div>
              </div>
            )}

            <div
              className="text-accent-foreground flex flex-row gap-2 items-center hover:bg-green-200/10 p-2 rounded-md cursor-pointer "
              onClick={() => handlePinChat()}
            >
              <Pin size={16} />
              <p>Pin Chat</p>
            </div>
          </div>
          <div className="p-2">
            <h5 className="text-zinc-400 text-xs">Participants:</h5>
            <div className="flex flex-col pt-2">
              {singleChat.chat.participants.map((participant) => {
                const canKick = participant._id !== user?._id && isGroup; // TODO: and is admin check
                return (
                  <div className="flex flex-row justify-start items-center p-1 gap-2">
                    <AvatarWithBadge
                      name={participant.name!}
                      src={participant.avatar}
                    />
                    <p>
                      {participant._id === user?._id
                        ? "You"
                        : participant.name!}
                    </p>
                    {canKick && (
                      <div className="flex flex-col items-end grow">
                        <div
                          className="hover:bg-white/10 p-2 rounded-md cursor-pointer"
                          onClick={() => handleKickUser()}
                        >
                          <XCircle size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {isGroup && ( //TODO: add is admin check
                <div
                  className="flex flex-row items-center gap-2 hover:bg-white/10 p-2 rounded-md cursor-pointer"
                  onClick={() => handleAddUser()}
                >
                  <PlusCircleIcon size={16} />
                  Add a New Member
                </div>
              )}
            </div>
          </div>
          <div className="p-2">
            <div
              className="flex flex-row items-center gap-2 hover:bg-white/10 p-2 rounded-md cursor-pointer"
              onClick={() => handleGroupChangeBg()}
            >
              <Image size={16} /> Change Background
            </div>
            <div
              className="flex flex-row items-center gap-2 hover:bg-white/10 p-2 rounded-md cursor-pointer"
              onClick={() => (isGroup ? handleLeaveGroup() : handleBlockUser())}
            >
              {isGroup ? (
                <>
                  <DoorOpen size={16} /> Leave Group
                </>
              ) : (
                <>
                  <BanIcon size={16} /> Block User
                </>
              )}
            </div>
            <div
              className="text-destructive flex flex-row items-center gap-2 hover:bg-destructive/10 p-2 rounded-md cursor-pointer"
              onClick={() => handleDeleteChat()}
            >
              {/* TODO: Check if user admin or not a group */}
              {
                <>
                  <Trash2 size={16} /> Delete Chat
                </>
              }
            </div>
          </div>
        </>
      </PopoverContent>
    </Popover>
  );
};

export default ChatInfoPopover;
