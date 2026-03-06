import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TriangleAlertIcon } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const LinkingError = () => {
  const [searchParams, _] = useSearchParams();
  const message = searchParams.get("message");

  const [isOpen, setIsOpen] = useState(message !== null);

  if (!message?.includes("Google")) {
    window.location.href = "/";
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader className="place-items-center! items-center">
          <div className="bg-destructive/10 mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
            <TriangleAlertIcon className="text-destructive size-6" />
          </div>
          <AlertDialogTitle>Account Linking Error</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {message || "An error occurred while linking your account."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setIsOpen(false);
              window.location.href = "/";
            }}
          >
            Okay
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LinkingError;
