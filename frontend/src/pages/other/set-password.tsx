import CustomFormField from "@/components/custom-form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { OTHER_ROUTES } from "@/routes/routes";
import {
  setPasswordFormSchema,
  type SetPasswordFormSchemaType,
} from "@/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const SetPassword = () => {
  const { isLoading, setPassword } = useAuth();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const form = useForm<SetPasswordFormSchemaType>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SetPasswordFormSchemaType) => {
    if (isLoading) return;
    const success = await setPassword(values);
    if (success) navigate(OTHER_ROUTES.ROOT);
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate(OTHER_ROUTES.ROOT);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader className="flex flex-col items-center justify-center gap-3">
          <DialogTitle className="text-xl">Set your password</DialogTitle>
          <DialogDescription>
            Fill out the form to set your password
          </DialogDescription>
        </DialogHeader>
        <Card
          className="p-7
        m-1"
        >
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4"
              >
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
                <div className="flex flex-row justify-center gap-10">
                  <Button disabled={isLoading} type="submit" className="w-1/2">
                    {isLoading && <Spinner />}Set Password
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SetPassword;
