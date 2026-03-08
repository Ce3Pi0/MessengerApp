import OtpForm from "@/components/otp-form";
import QrCodeAlert from "@/components/custom-alert";
import { useAuth } from "@/hooks/use-auth";
import { OTHER_ROUTES } from "@/routes/routes";
import { useNavigate } from "react-router-dom";

const Verify2fa = () => {
  const { user, qrCode, verify2fa } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = async (otp: string) => {
    const verified = await verify2fa({ otp });
    if (verified) navigate(OTHER_ROUTES.ROOT);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {!qrCode && !user?.enabled2fa && (
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
    </div>
  );
};

export default Verify2fa;
