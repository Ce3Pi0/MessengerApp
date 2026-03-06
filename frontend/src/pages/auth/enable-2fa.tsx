import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { PROTECTED_ROUTES } from "@/routes/routes";
import { AlertCircleIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Enable2fa = () => {
  const { qrCode } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate(-1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col items-center justify-center">
        <DialogHeader className="flex flex-col items-center justify-center gap-3">
          <DialogTitle className="text-xl">Scan the QR code</DialogTitle>
          <DialogDescription>
            Scan the QR code in you Authenticator app
          </DialogDescription>
        </DialogHeader>
        {!qrCode && (
          <Alert variant="destructive" className="max-w-md">
            <AlertCircleIcon />
            <AlertTitle>QR Code Not Available</AlertTitle>
            <AlertDescription>
              The QR code is not available at this time!
              <a className="underline" href="/">
                Go Back
              </a>
            </AlertDescription>
          </Alert>
        )}
        {qrCode && (
          <>
            (
            <Card
              className="p-7
        m-1"
            >
              <CardContent className="flex flex-row align-middle justify-center">
                <img src={qrCode} />
              </CardContent>
            </Card>
            <Button
              className="max-w-1/3"
              type="button"
              onClick={() => navigate(PROTECTED_ROUTES.VERIFY_2FA)}
            >
              Verify
            </Button>
            )
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Enable2fa;
