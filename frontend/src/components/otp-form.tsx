import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldLabel } from "./ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./ui/input-otp";
import { useState } from "react";
import { Spinner } from "./ui/spinner";

interface Props {
  cardTitle: string;
  handleConfirm: (otp: string) => void;
}

const OtpForm = ({ cardTitle, handleConfirm }: Props) => {
  const { isLoading } = useAuth();
  const OTP_LEN: number = 6;

  const [otp, setOtp] = useState("");

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
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
            onClick={() => handleConfirm(otp)}
          >
            {isLoading && <Spinner />}
            Verify
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
};

export default OtpForm;
