import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/logo";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "react-router-dom";
import CustomFormField from "../../components/custom-form-field";
import {
  type RegisterFormSchemaType,
  registerFormSchema,
} from "@/validators/auth.validator";
import OrWith from "@/components/or-with";
import OauthButton from "@/components/oauth-button";

const SignUp = () => {
  const { register, isLoading } = useAuth();

  const form = useForm<RegisterFormSchemaType>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      provider: "local",
    },
  });

  const onSubmit = async (values: RegisterFormSchemaType) => {
    if (isLoading) return;
    const isOk = await register(values);
    if (isOk) {
      form.reset();
    }
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
                  fieldName="Name"
                  name="name"
                  control={form.control}
                  placeholder="John Doe"
                />
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
                <CustomFormField
                  fieldName="Confirm Password"
                  name="confirmPassword"
                  control={form.control}
                  type="password"
                  placeholder="********"
                />
                <Button disabled={isLoading} type="submit" className="w-full">
                  {isLoading && <Spinner />} Sign up
                </Button>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/" className="underline">
                    Sign in
                  </Link>
                </div>
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

export default SignUp;
