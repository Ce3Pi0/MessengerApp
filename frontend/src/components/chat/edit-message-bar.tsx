import { X } from "lucide-react";
import { Button } from "../ui/button";

interface Props {
  onCancel: () => void;
}

const EditMessageBar = ({ onCancel }: Props) => {
  return (
    <div className="flex flex-1 justify-between mt-2 p-3 text-sm absolute bottom-16 left-0 right-0 bg-card border-t animate-in slide-in-from-bottom pb-4 px-6 text-primary">
      <div className="flex-1">
        <h5 className="font-medium">Edit message</h5>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onCancel}
        className="shrink-0 size-6"
      >
        <X size={14} />
      </Button>
    </div>
  );
};

export default EditMessageBar;
