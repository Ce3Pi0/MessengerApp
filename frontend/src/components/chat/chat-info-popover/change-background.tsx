import { Image } from "lucide-react";

interface Props {
  handleGroupChangeBg: () => void;
}

const ChangeBackground = ({ handleGroupChangeBg }: Props) => {
  return (
    <div
      className="flex flex-row items-center gap-2 hover:bg-white/10 p-2 rounded-md cursor-pointer"
      onClick={() => handleGroupChangeBg()}
    >
      <Image size={16} /> Change Group Background
    </div>
  );
};

export default ChangeBackground;
