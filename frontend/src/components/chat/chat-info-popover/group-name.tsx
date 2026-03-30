import { useChat } from "@/hooks/use-chat";
import { Check, PencilLineIcon, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  groupName: string | undefined;
  setGroupName: React.Dispatch<React.SetStateAction<string | undefined>>;
  isGroupNameChanging: boolean;
  setIsGroupNameChanging: React.Dispatch<React.SetStateAction<boolean>>;
  resetGroupNameChange: () => void;
}

const GroupName = ({
  groupName,
  setGroupName,
  isGroupNameChanging,
  setIsGroupNameChanging,
  resetGroupNameChange,
}: Props) => {
  const { singleChat, sendUpdateChatName } = useChat();

  if (!singleChat) return null;

  const handleGroupNameChange = (e: React.SubmitEvent) => {
    if (e) e.preventDefault();

    if (groupName?.trim() === singleChat?.chat.groupName) {
      toast.error("Group name must be different");
      return;
    }

    if (!groupName?.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    sendUpdateChatName(singleChat.chat._id, groupName);
    setIsGroupNameChanging(false);
  };

  return (
    <div className="p-2">
      <h5 className="text-zinc-400 text-xs">Group name:</h5>

      <div className="flex flex-row gap-2 items-center">
        {!isGroupNameChanging && <h1>{singleChat?.chat.groupName}</h1>}
        {isGroupNameChanging && (
          <form
            className="flex items-center gap-1"
            onSubmit={(e) => handleGroupNameChange(e)}
          >
            <input
              autoFocus
              className="mt-1 pt-1 pb-1 rounded-md"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <div className="flex gap-1">
              <button
                className="p-1 text-success rounded-md hover:bg-success/30 cursor-pointer"
                type="submit"
              >
                <Check size={18} />
              </button>
              <button
                className="p-1 text-destructive rounded-md hover:bg-destructive/30 cursor-pointer"
                onClick={() => resetGroupNameChange()}
              >
                <X size={18} />
              </button>
            </div>
          </form>
        )}
        {!isGroupNameChanging && (
          <PencilLineIcon
            size={16}
            className="hover: cursor-pointer"
            onClick={() => setIsGroupNameChanging(true)}
          />
        )}
      </div>
    </div>
  );
};

export default GroupName;
