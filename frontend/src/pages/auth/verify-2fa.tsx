import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { OTHER_ROUTES } from "@/routes/routes";
import { AlertCircleIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Verify2fa = () => {
  const { qrCode, mfaVerifying, verify2fa } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const OTP_LEN: number = 6;

  const [otp, setOtp] = useState("");

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate(-1);
    }
  };

  const handleConfirm = async () => {
    const verified = await verify2fa({ otp });
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
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>Complete Setting up 2FA</CardTitle>
              <CardDescription>
                Enter the verification code from you authenticator app
                <span className="font-medium">{}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="otp-verification">
                    Verification code
                  </FieldLabel>
                </div>
                <InputOTP
                  maxLength={6}
                  id="otp-verification"
                  required
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator className="mx-2" />
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </Field>
            </CardContent>
            <CardFooter>
              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={otp.length < OTP_LEN}
                  onClick={() => handleConfirm()}
                >
                  {mfaVerifying && <Spinner />}
                  Verify
                </Button>
              </Field>
            </CardFooter>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Verify2fa;
