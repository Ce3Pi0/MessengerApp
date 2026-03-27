//TODO: Modularize!
import {
  BanIcon,
  Check,
  DoorOpen,
  Image,
  Info,
  PencilLineIcon,
  Star,
  StarOffIcon,
  Trash2,
  UserRoundKeyIcon,
  UserRoundX,
  Users2,
  X,
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
import { useNavigate } from "react-router-dom";
import { OTHER_ROUTES } from "@/routes/routes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import type { UserType } from "@/types/auth.type";
import AddUserPopover from "./add-user-popover";
import { toast } from "sonner";

const ChatInfoPopover = () => {
  const navigate = useNavigate();

  const [isLeaveGroupAlertOpen, setIsLeaveGroupAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [isRemoveUserAlertOpen, setIsRemoveUserAlertOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<UserType | null>(null);

  const { user } = useAuth();
  const {
    singleChat,
    sendDeleteChat,
    isDeletingChat,
    sendRemoveUser,
    isUserRemoving,
    sendPromoteUser,
    sendFavoriteChat,
    sendUnfavoriteChat,
    sendBlockUser,
    sendUnblockUser,
    sendUpdateChatName,
  } = useChat();

  const isGroup = singleChat?.chat.isGroup;

  if (!singleChat) return null;

  const [isGroupNameChanging, setIsGroupNameChanging] = useState(false);
  const [groupName, setGroupName] = useState(singleChat.chat.groupName);

  const handleFavoriteChat = () => {
    if (!user || !user.favorites) return;

    user.favorites.find((f) => f._id === singleChat.chat._id)
      ? sendUnfavoriteChat(singleChat.chat._id)
      : sendFavoriteChat(singleChat.chat._id);
  };

  const handleGroupNameChange = (e: React.SubmitEvent) => {
    if (e) e.preventDefault();

    if (groupName?.trim() === singleChat?.chat.groupName) {
      toast.error("Group name must be different");
      return;
    }

    if (!groupName?.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    sendUpdateChatName(singleChat.chat._id, groupName);
    setIsGroupNameChanging(false);
  };

  const resetGroupNameChange = () => {
    setGroupName(singleChat?.chat.groupName);
    setIsGroupNameChanging(false);
  };

  const handleGroupChangeBg = () => {};

  const handleGroupChangeAvatar = () => {};

  const handleDeleteChat = () => {
    sendDeleteChat(singleChat.chat._id);
    navigate(OTHER_ROUTES.ROOT);
  };

  const handleBlockUser = () => {
    if (!user) return;

    const otherUser = singleChat.chat.participants.find(
      (p) => p._id !== user._id,
    );

    if (!otherUser) return;

    sendBlockUser(otherUser?._id);
    navigate(OTHER_ROUTES.ROOT);
  };

  const handleUnblockUser = () => {
    if (!user) return;

    const otherUser = singleChat.chat.participants.find(
      (p) => p._id !== user._id,
    );

    if (!otherUser) return;

    sendUnblockUser(otherUser?._id);
  };

  const openKickUserAlert = (userToRemove: UserType) => {
    setUserToRemove(userToRemove);
    setIsRemoveUserAlertOpen(true);
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

  const isUserAdmin = singleChat.chat.administrators?.find(
    (a) => a._id === user?._id,
  );

  const otherUser = singleChat.chat.participants.find(
    (p) => p._id !== user?._id,
  );
  const isBlocked = user?.blocked?.includes(otherUser?._id ?? "");
  const isFavoriteChat = user?.favorites?.find(
    (c) => c._id === singleChat.chat._id,
  );

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
                <div className="p-2">
                  <h5 className="text-zinc-400 text-xs">Group name:</h5>

                  <div className="flex flex-row gap-2 items-center">
                    {!isGroupNameChanging && (
                      <h1>{singleChat?.chat.groupName}</h1>
                    )}
                    {isGroupNameChanging && (
                      <form
                        className="flex items-center gap-1"
                        onSubmit={(e) => handleGroupNameChange(e)}
                      >
                        <input
                          autoFocus
                          className="mt-1 pt-1 pb-1 rounded-md"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                        />
                        <div className="flex gap-1">
                          <button
                            className="p-1 text-success rounded-md hover:bg-success/30 cursor-pointer"
                            type="submit"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            className="p-1 text-destructive rounded-md hover:bg-destructive/30 cursor-pointer"
                            onClick={() => resetGroupNameChange()}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </form>
                    )}
                    {isUserAdmin && !isGroupNameChanging && (
                      <PencilLineIcon
                        size={16}
                        className="hover: cursor-pointer"
                        onClick={() => setIsGroupNameChanging(true)}
                      />
                    )}
                  </div>
                </div>
              )}
              {!isBlocked && (
                <div
                  className="text-accent-foreground flex flex-row gap-2 items-center hover:bg-green-200/10 p-2 rounded-md cursor-pointer "
                  onClick={() => handleFavoriteChat()}
                >
                  {isFavoriteChat ? (
                    <>
                      <StarOffIcon size={16} />
                      <p>Unfavorite Chat</p>
                    </>
                  ) : (
                    <>
                      <Star size={16} />
                      <p>Favorite Chat</p>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="p-2">
              <h5 className="text-zinc-400 text-xs">Participants:</h5>
              <div className="flex flex-col pt-2">
                <div className="flex flex-row justify-start items-center p-1 gap-2">
                  <AvatarWithBadge name={user?.name!} src={user?.avatar} />
                  <div>
                    <p className="text-xs">You</p>
                    <p className="text-[0.6rem] text-gray-500">
                      {isUserAdmin && "Admin"}
                    </p>
                  </div>
                </div>
                {singleChat.chat.participants
                  .filter((participant) => participant._id !== user?._id)
                  .map((participant) => {
                    const canKick =
                      participant._id !== user?._id && isGroup && isUserAdmin;
                    const canPromote =
                      participant._id !== user?._id &&
                      isGroup &&
                      isUserAdmin &&
                      !singleChat.chat.administrators?.find(
                        (a) => a._id === participant?._id,
                      );

                    return (
                      <div
                        className="flex flex-row justify-start items-center p-1 gap-2"
                        key={participant._id}
                      >
                        <AvatarWithBadge
                          name={participant.name!}
                          src={participant.avatar}
                        />
                        <div>
                          <p className="text-xs">{participant.name!}</p>
                          <p className="text-[0.6rem] text-gray-500">
                            {singleChat.chat.administrators?.find(
                              (a) => a._id === participant?._id,
                            ) && "Admin"}
                          </p>
                        </div>
                        <div className="flex flex-row items-end justify-end grow">
                          {canPromote && (
                            <div className="flex flex-col items-end">
                              <div
                                className="hover:bg-white/10 p-2 rounded-md cursor-pointer"
                                onClick={() =>
                                  sendPromoteUser(
                                    singleChat.chat._id,
                                    participant._id,
                                  )
                                }
                              >
                                <UserRoundKeyIcon size={16} />
                              </div>
                            </div>
                          )}
                          {canKick && (
                            <div className="flex flex-col items-end">
                              <div
                                className="hover:bg-destructive/10 p-2 rounded-md cursor-pointer"
                                onClick={() => openKickUserAlert(participant)}
                              >
                                <UserRoundX size={16} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {isGroup && isUserAdmin && <AddUserPopover />}
              </div>
            </div>
            <div className="p-2">
              {isGroup && isUserAdmin && (
                <div
                  className="flex flex-row items-center gap-2 hover:bg-white/10 p-2 rounded-md cursor-pointer"
                  onClick={() => handleGroupChangeAvatar()}
                >
                  <Users2 size={16} /> Change Group Avatar
                </div>
              )}
              {isGroup && isUserAdmin && (
                <div
                  className="flex flex-row items-center gap-2 hover:bg-white/10 p-2 rounded-md cursor-pointer"
                  onClick={() => handleGroupChangeBg()}
                >
                  <Image size={16} /> Change Group Background
                </div>
              )}
              <div
                className="flex flex-row items-center gap-2 hover:bg-white/10 p-2 rounded-md cursor-pointer"
                onClick={() =>
                  isGroup
                    ? openLeaveChatAlert()
                    : isBlocked
                      ? handleUnblockUser()
                      : handleBlockUser()
                }
              >
                {isGroup ? (
                  <>
                    <DoorOpen size={16} /> Leave Group
                  </>
                ) : !isBlocked ? (
                  <>
                    <BanIcon size={16} /> Block User
                  </>
                ) : (
                  <>Unblock User</>
                )}
              </div>
              {!isGroup ||
                (isUserAdmin && (
                  <div
                    className="text-destructive flex flex-row items-center gap-2 hover:bg-destructive/10 p-2 rounded-md cursor-pointer"
                    onClick={() => setIsDeleteAlertOpen(true)}
                  >
                    {
                      <>
                        <Trash2 size={16} /> Delete Chat
                      </>
                    }
                  </div>
                ))}
            </div>
          </>
        </PopoverContent>
      </Popover>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              chat and all of its messages from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingChat}
              onClick={() => handleDeleteChat()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingChat && <Spinner className="w-6 h-6" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isRemoveUserAlertOpen}
        onOpenChange={setIsRemoveUserAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will kick {userToRemove?.name} from the group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isUserRemoving}
              onClick={() => handleLeaveGroup()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUserRemoving && <Spinner className="w-6 h-6" />}
              Kick
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isLeaveGroupAlertOpen}
        onOpenChange={setIsLeaveGroupAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to leave this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isUserRemoving}
              onClick={() => handleKickUser()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUserRemoving && <Spinner className="w-6 h-6" />}
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatInfoPopover;
