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
import { OTHER_ROUTES } from "@/routes/routes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ConfirmDisable2fa = () => {
  const navigate = useNavigate();
  const { isLoading, disable2fa } = useAuth();

  const [isOpen, setIsOpen] = useState(true);

  const handleDisable2FA = async () => {
    const res = await disable2fa();
    if (res) navigate(OTHER_ROUTES.ROOT);
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
          <AlertDialogTitle>
            Are you sure you want to disable 2FA?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Having 2FA enabled on your account makes it more difficult for
            hackers to access
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={() => handleDisable2FA()}
          >
            {isLoading && <Spinner />}Disable
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDisable2fa;
