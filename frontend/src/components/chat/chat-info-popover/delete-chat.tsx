import { Trash2 } from "lucide-react";
import React from "react";

interface Props {
  setIsDeleteAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteChat = ({ setIsDeleteAlertOpen }: Props) => {
  return (
    <div
      className="text-destructive flex flex-row items-center gap-2 hover:bg-destructive/10 p-2 rounded-md cursor-pointer"
      onClick={() => setIsDeleteAlertOpen(true)}
    >
      {
        <>
          <Trash2 size={16} /> Delete Chat
        </>
      }
    </div>
  );
};

export default DeleteChat;
