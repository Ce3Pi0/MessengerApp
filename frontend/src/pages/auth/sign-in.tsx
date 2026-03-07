import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/logo";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Link, useNavigate } from "react-router-dom";
import CustomFormField from "../../components/custom-form-field";
import {
  type LoginFormSchemaType,
  loginFormSchema,
} from "@/validators/auth.validator";
import OrWith from "@/components/or-with";
import OauthButton from "@/components/oauth-button";
import { AUTH_ROUTES } from "@/routes/routes";

const SignIn = () => {
  const { login, resendVerification, isLoggingIn, isConfirmed } = useAuth();

  const navigate = useNavigate();

  const form = useForm<LoginFormSchemaType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormSchemaType) => {
    if (isLoggingIn) return;
    const mfaRequired = await login(values);
    if (mfaRequired) navigate(AUTH_ROUTES.VERIFY_2FA);
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="flex flex-col items-center justify-center gap-3">
            <Logo />
            <CardTitle className="text-xl">Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4"
              >
                <CustomFormField
                  fieldName="Email"
                  name="email"
                  control={form.control}
                  type="email"
                  placeholder="johndoe@example.com"
                />
                <CustomFormField
                  fieldName="Password"
                  name="password"
                  control={form.control}
                  type="password"
                  placeholder="********"
                />
                <a
                  className="underline text-xs hover:text-blue-300 w-fit"
                  href="/forgot-password"
                >
                  Forgot Password?
                </a>
                <Button disabled={isLoggingIn} type="submit" className="w-full">
                  {isLoggingIn && <Spinner />} Sign in
                </Button>

                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link to="/sign-up" className="underline">
                    Sign up
                  </Link>
                </div>

                {form.getValues("email") && isConfirmed === false && (
                  <div
                    onClick={() => {
                      resendVerification({ email: form.getValues("email") });
                    }}
                    className="text-center text-sm underline cursor-pointer w-fit mx-auto"
                  >
                    Resend verification email
                  </div>
                )}
              </form>
            </Form>
            <OrWith />
            <OauthButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
