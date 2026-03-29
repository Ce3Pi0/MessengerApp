import { useChat } from "@/hooks/use-chat";
import type { UserType } from "@/types/auth.type";
import type { ChatType } from "@/types/chat.types";
import { Star, StarOffIcon } from "lucide-react";

interface Props {
  user: UserType | null;
  chat: ChatType;
}

const FavoriteChat = ({ user, chat }: Props) => {
  if (!user) return null;

  const handleFavoriteChat = () => {
    const { sendFavoriteChat, sendUnfavoriteChat } = useChat();

    if (!user || !user.favorites) return;

    user.favorites.find((f) => f._id === chat._id)
      ? sendUnfavoriteChat(chat._id)
      : sendFavoriteChat(chat._id);
  };

  const isFavoriteChat = user?.favorites?.find((c) => c._id === chat._id);

  return (
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
  );
};

export default FavoriteChat;
