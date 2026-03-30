import AvatarWithBadge from "@/components/avatar-with-badge";
import type { UserType } from "@/types/auth.type";
import type { ChatType } from "@/types/chat.types";
import { UserRoundKeyIcon, UserRoundX } from "lucide-react";
import AddUserPopover from "./add-user-popover";
import { useChat } from "@/hooks/use-chat";

interface Props {
  user: UserType | null;
  chat: ChatType;
  isUserAdmin: boolean;
  isGroup: boolean | undefined;
  setUserToRemove: React.Dispatch<React.SetStateAction<UserType | null>>;
  setIsRemoveUserAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Participants = ({
  user,
  chat,
  isUserAdmin,
  isGroup,
  setUserToRemove,
  setIsRemoveUserAlertOpen,
}: Props) => {
  if (!user) return null;

  const { sendPromoteUser } = useChat();

  const openKickUserAlert = (userToRemove: UserType) => {
    setUserToRemove(userToRemove);
    setIsRemoveUserAlertOpen(true);
  };

  return (
    <div className="p-2">
      <h5 className="text-zinc-400 text-xs">Participants:</h5>
      <div className="flex flex-col pt-2">
        <div className="flex flex-row justify-start items-center p-1 gap-2">
          <AvatarWithBadge name={user?.name!} src={user?.avatar} />
          <div>
            <p className="text-xs">You</p>
            {isUserAdmin && (
              <p className="text-[0.6rem] text-gray-200 bg-primary/40 rounded-sm p-0.5 mt-1 w-fit">
                Group Admin
              </p>
            )}
          </div>
        </div>
        {chat.participants
          .filter((participant) => participant._id !== user?._id)
          .map((participant) => {
            const canKick =
              participant._id !== user?._id && isGroup && isUserAdmin;
            const canPromote =
              participant._id !== user?._id &&
              isGroup &&
              isUserAdmin &&
              !chat.administrators?.find((a) => a._id === participant?._id);

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

                  {chat.administrators?.find(
                    (a) => a._id === participant?._id,
                  ) && (
                    <p className="text-[0.6rem] text-gray-200 bg-primary/40 rounded-sm p-0.5 mt-1 w-fit">
                      Group Admin
                    </p>
                  )}
                </div>
                <div className="flex flex-row items-end justify-end grow">
                  {canPromote && (
                    <div className="flex flex-col items-end">
                      <div
                        className="hover:bg-white/10 p-2 rounded-md cursor-pointer"
                        onClick={() =>
                          sendPromoteUser(chat._id, participant._id)
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
  );
};

export default Participants;
