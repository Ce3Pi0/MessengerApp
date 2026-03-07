import OtpForm from "@/components/otp-form";
import QrCodeAlert from "@/components/custom-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { OTHER_ROUTES } from "@/routes/routes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Verify2fa = () => {
  const { qrCode, verify2fa } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate(-1);
    }
  };

  const handleConfirm = async (otp: string) => {
    const verified = await verify2fa({ otp });
    setIsOpen(false);
    if (verified) navigate(OTHER_ROUTES.ROOT);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader className="flex flex-col items-center justify-center gap-3">
          <DialogTitle className="text-xl">Scan the QR code</DialogTitle>
          <DialogDescription>
            Scan the QR code in you Authenticator app
          </DialogDescription>
        </DialogHeader>
        {!qrCode && (
          <QrCodeAlert
            alertTitle="QR Code Not Available"
            alertDescription="The QR code is not available at this time!"
          />
        )}
        {qrCode && (
          <OtpForm
            cardTitle="Complete Setting up 2FA"
            handleConfirm={handleConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Verify2fa;
