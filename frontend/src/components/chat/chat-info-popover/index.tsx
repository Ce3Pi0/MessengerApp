import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "../../ui/popover";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { OTHER_ROUTES } from "@/routes/routes";
import { useState } from "react";
import type { UserType } from "@/types/auth.type";
import InfoChatPopoverAlert from "./info-chat-alert";
import GroupName from "./group-name";
import FavoriteChat from "./favorite-chat";
import Participants from "./participants";
import ChangeGroupAvatar from "./change-group-avatar";
import LeaveOrBlock from "./leave-or-block";
import DeleteChat from "./delete-chat";
import ChangeBackground from "./change-background";
import ChangeAvatarDialog from "./change-avatar-dialog";

const ChatInfoPopover = () => {
  const navigate = useNavigate();

  const [isLeaveGroupAlertOpen, setIsLeaveGroupAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [isRemoveUserAlertOpen, setIsRemoveUserAlertOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<UserType | null>(null);

  const [changingAvatar, setChangingAvatar] = useState(false);

  const { user } = useAuth();
  const {
    singleChat,
    sendDeleteChat,
    isDeletingChat,
    sendRemoveUser,
    isUserRemoving,
  } = useChat();

  const isGroup = singleChat?.chat.isGroup;

  if (!singleChat) return null;

  const [isGroupNameChanging, setIsGroupNameChanging] = useState(false);
  const [groupName, setGroupName] = useState(singleChat.chat.groupName);

  const handleGroupChangeTheme = () => {};

  const handleDeleteChat = () => {
    sendDeleteChat(singleChat.chat._id);
    navigate(OTHER_ROUTES.ROOT);
  };

  const openLeaveChatAlert = () => {
    setUserToRemove(user);
    setIsLeaveGroupAlertOpen(true);
  };
  const handleKickUser = () => {
    if (!userToRemove) return;
    sendRemoveUser(singleChat.chat._id, userToRemove._id);
  };

  const handleLeaveGroup = () => {
    if (!userToRemove) return;
    sendRemoveUser(singleChat.chat._id, userToRemove._id);
  };

  const isUserAdmin =
    singleChat.chat.administrators?.find((a) => a._id === user?._id) !==
    undefined;

  const otherUser = singleChat.chat.participants.find(
    (p) => p._id !== user?._id,
  );
  const isBlocked = user?.blocked?.includes(otherUser?._id ?? "");

  const resetGroupNameChange = () => {
    setGroupName(singleChat?.chat.groupName);
    setIsGroupNameChanging(false);
  };

  return (
    <>
      <Popover onOpenChange={() => resetGroupNameChange()}>
        <PopoverTrigger asChild>
          <div>
            <div className="flex-1 text-center py-4 h-full font-medium text-accent-foreground hover:text-primary cursor-pointer">
              <Info size={24} />
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
                <GroupName
                  groupName={groupName}
                  setGroupName={setGroupName}
                  isGroupNameChanging={isGroupNameChanging}
                  setIsGroupNameChanging={setIsGroupNameChanging}
                  resetGroupNameChange={resetGroupNameChange}
                />
              )}
              {!isBlocked && (
                <FavoriteChat user={user} chat={singleChat.chat} />
              )}
            </div>
            <Participants
              user={user}
              chat={singleChat.chat}
              isUserAdmin={isUserAdmin}
              isGroup={isGroup}
              setUserToRemove={setUserToRemove}
              setIsRemoveUserAlertOpen={setIsRemoveUserAlertOpen}
            />
            <div className="p-2">
              {isGroup && isUserAdmin && (
                <ChangeGroupAvatar openAvatarDialog={setChangingAvatar} />
              )}
              {isGroup && isUserAdmin && (
                <ChangeBackground
                  handleGroupChangeBg={handleGroupChangeTheme}
                />
              )}
              <LeaveOrBlock
                user={user}
                chat={singleChat.chat}
                isGroup={isGroup}
                isBlocked={isBlocked}
                openLeaveChatAlert={openLeaveChatAlert}
              />
              {(isUserAdmin || !isGroup) && (
                <DeleteChat setIsDeleteAlertOpen={setIsDeleteAlertOpen} />
              )}
            </div>
          </>
        </PopoverContent>
      </Popover>

      {/* Delete Chat Alert */}
      <InfoChatPopoverAlert
        isOpen={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete this
              chat and all of its messages from our servers."
        isDeleting={isDeletingChat}
        handleDelete={handleDeleteChat}
        actionMsg="Delete"
      />

      {/* Kick User Alert */}
      <InfoChatPopoverAlert
        isOpen={isRemoveUserAlertOpen}
        onOpenChange={setIsRemoveUserAlertOpen}
        title="Are you absolutely sure?"
        description={`This action will kick ${userToRemove?.name} from the group.`}
        isDeleting={isUserRemoving}
        handleDelete={handleLeaveGroup}
        actionMsg="Kick"
      />

      {/* Leave Group Alert */}
      <InfoChatPopoverAlert
        isOpen={isLeaveGroupAlertOpen}
        onOpenChange={setIsLeaveGroupAlertOpen}
        title="Are you absolutely sure?"
        description="You are about to leave this group."
        isDeleting={isUserRemoving}
        handleDelete={handleKickUser}
        actionMsg="Leave"
      />

      <ChangeAvatarDialog
        isOpen={changingAvatar}
        onOpenChange={setChangingAvatar}
      />
    </>
  );
};

export default ChatInfoPopover;
