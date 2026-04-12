import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { LoginFormSchemaType } from "@/validators/auth.validator";
import type { Control } from "react-hook-form";

interface Props {
  control: Control<LoginFormSchemaType, any, LoginFormSchemaType>;
  fieldName: string;
  name: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder: string;
}

const CustomFormField = ({
  fieldName,
  name,
  control,
  type,
  placeholder,
}: Props) => {
  return (
    <FormField
      control={control}
      name={name === "email" ? "email" : "password"}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{fieldName}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
