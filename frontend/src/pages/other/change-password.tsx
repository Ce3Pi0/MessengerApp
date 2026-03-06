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
  changePasswordFormSchema,
  type ChangePasswordFormSchemaType,
} from "@/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const { isChanging, changePassword } = useAuth();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const form = useForm<ChangePasswordFormSchemaType>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordFormSchemaType) => {
    if (isChanging) return;
    const success = await changePassword(values);
    if (success) navigate(OTHER_ROUTES.ROOT);
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate(-1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader className="flex flex-col items-center justify-center gap-3">
          <DialogTitle className="text-xl">Change your password</DialogTitle>
          <DialogDescription>
            Fill out the form to change your password
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
                  fieldName="Current Password"
                  name="currentPassword"
                  control={form.control}
                  type="password"
                  placeholder="********"
                />
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
                <div className="flex flex-row justify-center gap-10">
                  <Button type="submit" className="w-1/2">
                    {isChanging && <Spinner />}Change Password
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

export default ChangePassword;
