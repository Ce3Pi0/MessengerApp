import type { MessageType } from "@/types/chat.types";

interface Props {
  message: MessageType;
}

const SystemMessage = ({ message }: Props) => {
  return (
    <div className="group flex gap-2 py-3 px-4 flex-row items-center justify-center">
      <div className="flex items-center gap-1">
        <div className="min-w-50 px-3 py-2 text-xs wrap-break-words shadow-sm bg-accent dark:bg-accent/50 rounded-md">
          {message.content && <p>{message.content}</p>}
        </div>
      </div>
    </div>
  );
};

export default SystemMessage;
