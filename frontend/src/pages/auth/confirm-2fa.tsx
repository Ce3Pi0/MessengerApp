import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";
import { OTHER_ROUTES } from "@/routes/routes";

const Confirm2fa = () => {
  const { user, waitingMfa, verify2fa, mfaVerifying } = useAuth();

  const navigate = useNavigate();

  const OTP_LEN: number = 6;
  const [otp, setOtp] = useState("");

  const handleConfirm = async () => {
    const verified = await verify2fa({ otp });
    if (verified) navigate(OTHER_ROUTES.ROOT);
  };

  if (user || !waitingMfa)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircleIcon />
          <AlertTitle>OTP Token Not Required</AlertTitle>
          <AlertDescription>
            You do not need to enter an OTP token at this time!
            <a className="underline" href="/">
              Go Back
            </a>
          </AlertDescription>
        </Alert>
      </div>
    );
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Verify your login</CardTitle>
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
              type="button"
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
    </div>
  );
};

export default Confirm2fa;
