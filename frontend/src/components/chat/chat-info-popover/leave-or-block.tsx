import { useChat } from "@/hooks/use-chat";
import { OTHER_ROUTES } from "@/routes/routes";
import type { UserType } from "@/types/auth.type";
import type { ChatType } from "@/types/chat.types";
import { BanIcon, DoorOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  user: UserType | null;
  chat: ChatType;
  isGroup: boolean | undefined;
  isBlocked: boolean | undefined;
  openLeaveChatAlert: () => void;
}

const LeaveOrBlock = ({
  user,
  chat,
  isGroup,
  isBlocked,
  openLeaveChatAlert,
}: Props) => {
  const { sendBlockUser, sendUnblockUser } = useChat();
  const navigate = useNavigate();

  const handleBlockUser = () => {
    if (!user) return;

    const otherUser = chat.participants.find((p) => p._id !== user._id);

    if (!otherUser) return;

    sendBlockUser(otherUser?._id);
    navigate(OTHER_ROUTES.ROOT);
  };

  const handleUnblockUser = () => {
    if (!user) return;

    const otherUser = chat.participants.find((p) => p._id !== user._id);

    if (!otherUser) return;

    sendUnblockUser(otherUser?._id);
  };

  return (
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
  );
};

export default LeaveOrBlock;
