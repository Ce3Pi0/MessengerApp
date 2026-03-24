import { useChat } from "@/hooks/use-chat";
import { memo, useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Search, UserRoundPlus } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";
import type { UserType } from "@/types/auth.type";
import AvatarWithBadge from "../avatar-with-badge";

const AddUserPopover = memo(() => {
  const {
    fetchUsers,
    fetchExtraUsers,
    users,
    isUsersLoading,
    gettingMoreUsers,
    singleChat,
    sendAddUser,
  } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [scrollHeight, setScrollHeight] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredUsers = users?.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !singleChat?.chat.participants.find((p) => p._id === user._id),
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className="flex flex-row items-center gap-2 hover:bg-white/10 p-2 rounded-md cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <UserRoundPlus size={16} />
          Add a New Member
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        className="w-80 z-9999 p-0
         rounded-xl min-h-100
         max-h-[80vh] flex flex-col
        "
      >
        <div className="border-b p-3 flex flex-col gap-2">
          <InputGroup>
            <InputGroupInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={"Search name"}
            />
            <InputGroupAddon>
              <Search />
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
          ) : (
            filteredUsers.map((user) => (
              <UserItem
                key={user._id}
                chatId={singleChat?.chat._id!}
                user={user}
                sendAddUser={sendAddUser}
                setIsOpen={setIsOpen}
              />
            ))
          )}
          {gettingMoreUsers && (
            <div className="flex items-center justify-center p-2">
              <Spinner className="w-5 h-5 text-primary!" />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});
AddUserPopover.displayName = "AddUserPopover";

const UserAvatar = memo(({ user }: { user: UserType }) => (
  <>
    <AvatarWithBadge name={user.name} src={user.avatar ?? ""} />
    <div className="flex-1 min-w-0">
      <h5 className="text-[13.5px] font-medium truncate">{user.name}</h5>
      <p className="text-xs text-muted-foreground">Hey there! I'm using whop</p>
    </div>
  </>
));

UserAvatar.displayName = "UserAvatar";

const UserItem = memo(
  ({
    chatId,
    user,
    sendAddUser,
    setIsOpen,
  }: {
    chatId: string;
    user: UserType;
    sendAddUser: (chatId: string, participantId: string) => void;
    setIsOpen: (open: boolean) => void;
  }) => (
    <button
      className="
      relative w-full flex items-center gap-2 p-2
    rounded-sm hover:bg-accent
       transition-colors text-left disabled:opacity-50"
      onClick={() => {
        sendAddUser(chatId, user._id);
        setIsOpen(false);
      }}
    >
      <UserAvatar user={user} />
    </button>
  ),
);

UserItem.displayName = "UserItem";

export default AddUserPopover;
