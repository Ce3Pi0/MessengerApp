import { memo, useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ArrowLeft, PenBoxIcon, Search, UsersIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";
import type { UserType } from "../../types/auth.type";
import AvatarWithBadge from "../avatar-with-badge";
import { Checkbox } from "../ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const NewChatPopover = memo(() => {
  const navigate = useNavigate();
  const {
    fetchUsers,
    fetchExtraUsers,
    fetchAiUser,
    users,
    aiUser,
    isUsersLoading,
    gettingMoreUsers,
    createChat,
    isCreatingChat,
    gettingAiUser,
  } = useChat();

  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const [scrollHeight, setScrollHeight] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredUsers = users?.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, clientHeight, scrollHeight } = container;

    const isAtBottom = scrollHeight - clientHeight <= scrollTop;

    if (isAtBottom) {
      setScrollHeight(0);
      fetchExtraUsers();
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current && scrollHeight > 0) {
      const container = scrollContainerRef.current;
      const addedHeight = container.scrollHeight - scrollHeight;
      container.scrollTop = addedHeight;
    }
  }, [filteredUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchAiUser();
  }, [fetchAiUser]);

  const toggleUserSelection = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id],
    );
  };

  const handleBack = () => {
    resetState();
  };

  const resetState = () => {
    setIsGroupMode(false);
    setGroupName("");
    setSelectedUsers([]);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    resetState();
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers?.length === 0) return;
    const response = await createChat({
      isGroup: true,
      participants: selectedUsers,
      groupName: groupName,
    });
    setIsOpen(false);
    resetState();
    navigate(`/chat/${response?._id}`);
  };

  const handleCreateChat = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      const response = await createChat({
        isGroup: false,
        participantId: userId,
      });
      setIsOpen(false);
      resetState();
      navigate(`/chat/${response?._id}`);
    } finally {
      setLoadingUserId(null);
      setIsOpen(false);
      resetState();
    }
  };

  if (!user) return;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <PenBoxIcon className="h-5! w-5! stroke-1!" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 z-999 p-0
         rounded-xl min-h-100
         max-h-[80vh] flex flex-col
        "
      >
        <div className="border-b p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {isGroupMode && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft size={16} />
              </Button>
            )}
            <h3 className="text-lg font-semibold">
              {isGroupMode ? "New Group" : "New Chat"}
            </h3>
          </div>

          <InputGroup>
            <InputGroupInput
              value={isGroupMode ? groupName : searchQuery}
              onChange={
                isGroupMode
                  ? (e) => setGroupName(e.target.value)
                  : (e) => setSearchQuery(e.target.value)
              }
              placeholder={isGroupMode ? "Enter group name" : "Search name"}
            />
            <InputGroupAddon>
              {isGroupMode ? <UsersIcon /> : <Search />}
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div
          className="flex-1 justify-center overflow-y-auto
         px-1 py-1 space-y-1
        "
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {isUsersLoading ? (
            <Spinner className="w-6 h-6" />
          ) : users && users?.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No users found
            </div>
          ) : !isGroupMode ? (
            <>
              <NewGroupItem
                disabled={isCreatingChat}
                onClick={() => setIsGroupMode(true)}
              />
              {aiUser && (
                <AiChatUserItem
                  user={aiUser}
                  isLoading={loadingUserId === aiUser._id || gettingAiUser}
                  disabled={loadingUserId !== null}
                  onClick={handleCreateChat}
                />
              )}
              {filteredUsers?.map((otherUser) => {
                return (
                  <ChatUserItem
                    key={otherUser._id}
                    user={user}
                    otherUser={otherUser}
                    isBlocked={user.blocked?.includes(otherUser._id) ?? false}
                    isLoading={loadingUserId === otherUser._id}
                    disabled={loadingUserId !== null}
                    onClick={handleCreateChat}
                  />
                );
              })}
            </>
          ) : (
            users?.map((otherUser) => (
              <GroupUserItem
                key={otherUser._id}
                user={user}
                otherUser={otherUser}
                isBlocked={user.blocked?.includes(otherUser._id) ?? false}
                isSelected={selectedUsers.includes(otherUser._id)}
                onToggle={toggleUserSelection}
              />
            ))
          )}
          {gettingMoreUsers && (
            <div className="flex items-center justify-center p-2">
              <Spinner className="w-5 h-5 text-primary!" />
            </div>
          )}
        </div>

        {isGroupMode && (
          <div className="border-t p-3">
            <Button
              onClick={handleCreateGroup}
              className="w-full"
              disabled={
                isCreatingChat ||
                !groupName.trim() ||
                selectedUsers.length === 0
              }
            >
              {isCreatingChat && <Spinner className="w-4 h-4" />}
              Create Group
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});
NewChatPopover.displayName = "NewChatPopover";

const UserAvatar = memo(
  ({ user, otherUser }: { user: UserType; otherUser: UserType }) => {
    const { sendUnblockUser } = useChat();

    const unblockUser = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      sendUnblockUser(otherUser._id);
    };

    return (
      <>
        <AvatarWithBadge name={otherUser.name} src={otherUser.avatar ?? ""} />
        <div className="flex-1 min-w-0">
          <h5 className="text-[13.5px] font-medium truncate">
            {otherUser.name}
          </h5>
          <p className="text-xs text-muted-foreground">
            Hey there! I'm using whop
          </p>
        </div>
        {user.blocked!.includes(otherUser._id) && (
          <div
            className="border hover:bg-accent p-1 rounded-sm text-xs"
            onClick={unblockUser}
          >
            Unblock
          </div>
        )}
      </>
    );
  },
);

UserAvatar.displayName = "UserAvatar";

const AiAvatar = memo(({ user }: { user: UserType }) => {
  return (
    <>
      <AvatarWithBadge name={user.name} src={user.avatar ?? ""} />
      <div className="flex-1 min-w-0">
        <h5 className="text-[13.5px] font-medium truncate">{user.name}</h5>
        <p className="text-xs text-muted-foreground">
          Hey there! I'm your AI assistant
        </p>
      </div>
    </>
  );
});

AiAvatar.displayName = "AiAvatar";

const NewGroupItem = memo(
  ({ disabled, onClick }: { disabled: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center
       gap-2 p-2 rounded-sm hover:bg-accent
       transition-colors text-left disabled:opacity-50
      "
    >
      <div className="bg-primary/10 p-2 rounded-full">
        <UsersIcon className="size-4 text-primary" />
      </div>
      <span>New Group</span>
    </button>
  ),
);

NewGroupItem.displayName = "NewGroupItem";

const ChatUserItem = memo(
  ({
    isBlocked,
    otherUser,
    user,
    isLoading,
    disabled,
    onClick,
  }: {
    isBlocked: boolean;
    otherUser: UserType;
    user: UserType;
    disabled: boolean;
    isLoading: boolean;
    onClick: (id: string) => void;
  }) => {
    const handleClick = () => {
      if (isBlocked) return;
      onClick(otherUser._id);
    };

    return (
      <button
        className={cn(
          isBlocked
            ? "w-full flex items-center gap-2 p-2 rounded-sm text-left"
            : "w-full flex items-center gap-2 p-2 rounded-sm hover:bg-accent transition-colors text-left disabled:opacity-50",
        )}
        disabled={isLoading || disabled}
        onClick={handleClick}
      >
        <UserAvatar user={user} otherUser={otherUser} />
        {isLoading && <Spinner className="absolute right-2 w-4 h-4 ml-auto" />}
      </button>
    );
  },
);

ChatUserItem.displayName = "ChatUserItem";

const AiChatUserItem = memo(
  ({
    user,
    isLoading,
    disabled,
    onClick,
  }: {
    user: UserType;
    disabled: boolean;
    isLoading: boolean;
    onClick: (id: string) => void;
  }) => {
    const handleClick = () => {
      onClick(user._id);
    };

    return (
      <button
        className="w-full flex items-center gap-2 p-2 rounded-sm hover:bg-accent transition-colors text-left disabled:opacity-50"
        disabled={isLoading || disabled}
        onClick={handleClick}
      >
        <AiAvatar user={user} />
        {isLoading && <Spinner className="absolute right-2 w-4 h-4 ml-auto" />}
      </button>
    );
  },
);

AiChatUserItem.displayName = "AiChatUserItem";

const GroupUserItem = memo(
  ({
    user,
    otherUser,
    isBlocked,
    isSelected,
    onToggle,
  }: {
    user: UserType;
    otherUser: UserType;
    isBlocked: boolean;
    isSelected: boolean;
    onToggle: (id: string) => void;
  }) => {
    return (
      <label
        role="button"
        className={cn(
          isBlocked
            ? "w-full flex items-center gap-2 p-2 rounded-sm "
            : "w-full flex items-center gap-2 p-2 rounded-sm hover:bg-accent transition-colors text-left disabled:opacity-50",
        )}
      >
        <UserAvatar otherUser={otherUser} user={user} />
        {!isBlocked && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle(otherUser._id)}
          />
        )}
      </label>
    );
  },
);

GroupUserItem.displayName = "GroupUserItem";
