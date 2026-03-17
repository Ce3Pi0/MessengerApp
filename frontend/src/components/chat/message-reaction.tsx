import EmojiPicker, { Theme } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useTheme } from "../theme-provider";

interface Props {
  isPickerOpen: boolean;
  setIsPickerOpen: (isPickerOpen: boolean) => void;
}

const MessageReaction = ({ isPickerOpen, setIsPickerOpen }: Props) => {
  const themeData = useTheme();

  const handleReaction = async (emoji: string) => {
    // TODO: Send API request to backend
    console.log("Selected emoji:", emoji);
  };

  return (
    <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "flex transition-opacity rounded-full size-8 shrink-0",
            "border-gray-200 dark:border-gray-800",
            isPickerOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <Heart />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        className="p-0 border-none shadow-none"
      >
        <EmojiPicker
          theme={themeData.theme === "dark" ? Theme.DARK : Theme.LIGHT}
          className="dark: bg-amber-200"
          reactionsDefaultOpen={true}
          onEmojiClick={(emojiData) => {
            handleReaction(emojiData.emoji);
            setIsPickerOpen(false);
          }}
          lazyLoadEmojis={true}
        />
      </PopoverContent>
    </Popover>
  );
};

export default MessageReaction;
