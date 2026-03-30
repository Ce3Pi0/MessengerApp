import { Smile } from "lucide-react";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "../../theme-provider";

interface Props {
  addEmoji: (emoji: string) => void;
}

const EmojiSelection = ({ addEmoji }: Props) => {
  const themeData = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="gap-2 rounded-full"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        className="p-0 border-none shadow-none z-9999"
      >
        <EmojiPicker
          theme={themeData.theme === "dark" ? Theme.DARK : Theme.LIGHT}
          className="dark: bg-amber-200"
          onEmojiClick={(emojiData) => {
            addEmoji(emojiData.emoji);
          }}
          lazyLoadEmojis={true}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiSelection;
