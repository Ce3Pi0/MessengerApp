import type React from "react";
import { Users2 } from "lucide-react";

interface Props {
  openAvatarDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChangeGroupAvatar = ({ openAvatarDialog }: Props) => {
  return (
    <div
      className="flex flex-row items-center gap-2 hover:bg-white/10 p-2 rounded-md cursor-pointer"
      onClick={() => openAvatarDialog(true)}
    >
      <Users2 size={16} /> Change Group Avatar
    </div>
  );
};

export default ChangeGroupAvatar;
