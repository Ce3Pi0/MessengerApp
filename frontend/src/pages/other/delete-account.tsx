import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { AUTH_ROUTES } from "@/routes/routes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DeleteAccount = () => {
  const navigate = useNavigate();
  const { isLoading, deleteAccount } = useAuth();

  const [isOpen, setIsOpen] = useState(true);

  const handleDeleteAccount = async () => {
    const res = await deleteAccount();
    if (res) navigate(AUTH_ROUTES.SIGN_IN);
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate(-1);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={() => handleDeleteAccount()}
          >
            {isLoading && <Spinner />}Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccount;
