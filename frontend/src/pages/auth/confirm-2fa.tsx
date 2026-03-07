import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { OTHER_ROUTES } from "@/routes/routes";
import OtpForm from "@/components/otp-form";
import CustomAlert from "@/components/custom-alert";

const Confirm2fa = () => {
  const { user, waitingMfa, verify2fa } = useAuth();

  const navigate = useNavigate();

  const handleConfirm = async (otp: string) => {
    const verified = await verify2fa({ otp });
    if (verified) navigate(OTHER_ROUTES.ROOT);
  };

  if (user || !waitingMfa)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <CustomAlert
          alertTitle="OTP Token Not Required"
          alertDescription="You do not need to enter an OTP token at this time!"
        />
      </div>
    );
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <OtpForm cardTitle="Verify your login" handleConfirm={handleConfirm} />
    </div>
  );
};

export default Confirm2fa;
