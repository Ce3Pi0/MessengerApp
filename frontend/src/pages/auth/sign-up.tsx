import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/logo";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "react-router-dom";
import CustomFormField from "./custom-form-field";
import {
  type RegisterFormSchemaType,
  registerFormSchema,
} from "@/validators/auth.validator";

const SignUp = () => {
  const { register, isSigningUp } = useAuth();

  const form = useForm<RegisterFormSchemaType>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: RegisterFormSchemaType) => {
    if (isSigningUp) return;

    register(values);
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
                  name="name"
                  control={form.control}
                  placeholder="John Doe"
                />
                <CustomFormField
                  name="email"
                  control={form.control}
                  type="email"
                  placeholder="johndoe@example.com"
                />
                <CustomFormField
                  name="password"
                  control={form.control}
                  type="password"
                  placeholder="********"
                />
                <Button disabled={isSigningUp} type="submit" className="w-full">
                  {isSigningUp && <Spinner />} Sign up
                </Button>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/" className="underline">
                    Sign in
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
