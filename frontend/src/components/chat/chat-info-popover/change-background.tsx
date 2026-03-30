import type React from "react";
import { Image } from "lucide-react";

interface Props {
  openBackgroundDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChangeBackground = ({ openBackgroundDialog }: Props) => {
  return (
    <div
      className="flex flex-row items-center gap-2 hover:bg-white/10 p-2 rounded-md cursor-pointer"
      onClick={() => openBackgroundDialog(true)}
    >
      <Image size={16} /> Change Group Background
    </div>
  );
};

export default ChangeBackground;
