import QrCode from "@/components/qr-code";
import QrCodeAlert from "@/components/custom-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
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
          <QrCodeAlert
            alertTitle="QR Code Not Available"
            alertDescription="Please try again later."
          />
        )}
        {qrCode && <QrCode />}
      </DialogContent>
    </Dialog>
  );
};

export default Enable2fa;
