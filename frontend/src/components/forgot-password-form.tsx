import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

const ForgotPasswordForm = () => {
  const { sendForgotPassword } = useAuth();

  const [email, setEmail] = useState("");

  const handleSendEmail = () => {
    sendForgotPassword({ email });
  };

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-1">
        <Label className="leading-5" htmlFor="userEmail">
          Email address*
        </Label>
        <Input
          type="email"
          id="email"
          placeholder="Enter your email address"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <Button
        className="w-full"
        type="submit"
        onClick={() => handleSendEmail()}
      >
        Send Reset Link
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
