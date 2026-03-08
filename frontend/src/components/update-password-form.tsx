import { ChevronLeftIcon } from "lucide-react";
import CustomFormField from "./custom-form-field";
import Logo from "./logo";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Form } from "./ui/form";
import { Spinner } from "./ui/spinner";
import { useForm } from "react-hook-form";
import {
  updatePasswordFormSchema,
  type UpdatePasswordFormSchemaType,
} from "@/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { AUTH_ROUTES } from "@/routes/routes";

interface Props {
  token: string | null;
}

const UpdatePasswordForm = ({ token }: Props) => {
  const navigate = useNavigate();

  const { isLoading, updatePassword } = useAuth();

  const form = useForm<UpdatePasswordFormSchemaType>({
    resolver: zodResolver(updatePasswordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const handleUpdatePassword = async (values: UpdatePasswordFormSchemaType) => {
    if (isLoading) return;
    const res = await updatePassword(values, token);
    if (res) navigate(AUTH_ROUTES.SIGN_IN);
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="flex flex-col items-center justify-center gap-3">
            <Logo />
            <CardTitle className="text-xl">Update your password</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleUpdatePassword)}
                className="grid gap-4"
              >
                <CustomFormField
                  fieldName="New Password"
                  name="newPassword"
                  control={form.control}
                  type="password"
                  placeholder="********"
                />
                <CustomFormField
                  fieldName="Confirm New Password"
                  name="confirmNewPassword"
                  control={form.control}
                  type="password"
                  placeholder="********"
                />
                <Button disabled={isLoading} type="submit" className="w-full">
                  {isLoading && <Spinner />} Reset Password
                </Button>
                <a
                  href="/"
                  className="group mx-auto flex w-fit items-center gap-2"
                >
                  <ChevronLeftIcon className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  <span>Back to login</span>
                </a>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;
