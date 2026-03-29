import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Spinner } from "../../ui/spinner";

interface Props {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  description: string;
  isDeleting: boolean;
  handleDelete: () => void;
  actionMsg: string;
}

const InfoChatPopoverAlert = ({
  isOpen,
  onOpenChange,
  title,
  description,
  isDeleting,
  handleDelete,
  actionMsg,
}: Props) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={() => handleDelete()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Spinner className="w-6 h-6" />}
            {actionMsg}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InfoChatPopoverAlert;
