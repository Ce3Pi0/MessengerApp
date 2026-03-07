import { ChevronLeftIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ForgotPasswordForm from "@/components/forgot-password-form";
import UpdatePasswordForm from "@/components/update-password-form";

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  return (
    <>
      {!token && (
        <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
          <Card className="z-1 w-full border-none shadow-md sm:max-w-md">
            <CardHeader className="gap-6">
              <div>
                <CardTitle className="mb-1.5 text-2xl">
                  Forgot Password?
                </CardTitle>
                <CardDescription className="text-base">
                  Enter your email and we&apos;ll send you instructions to reset
                  your password
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ForgotPasswordForm />

              <a
                href="/"
                className="group mx-auto flex w-fit items-center gap-2"
              >
                <ChevronLeftIcon className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Back to login</span>
              </a>
            </CardContent>
          </Card>
        </div>
      )}
      {token && <UpdatePasswordForm token={token} />}
    </>
  );
};

export default ForgotPassword;
