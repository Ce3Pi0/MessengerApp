import { z } from "zod";

const MIN_NAME_LEN: number = 1;
const MIN_EMAIL_LEN: number = 5;
const MIN_PASSWORD_LEN: number = 10;

export const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .min(MIN_EMAIL_LEN, `Invalid email length | min length: ${MIN_EMAIL_LEN}`);

export const requiredPasswordSchema = (fieldName: string = "password") =>
  z
    .string()
    .trim()
    .min(
      MIN_PASSWORD_LEN,
      `Invalid ${fieldName} length-min: ${MIN_PASSWORD_LEN}`,
    );

export const passwordSchema = requiredPasswordSchema().optional();

export const changePasswordSchema = z
  .object({
    currentPassword: requiredPasswordSchema("currentPassword"),
    newPassword: requiredPasswordSchema("newPassword"),
    confirmNewPassword: requiredPasswordSchema("confirmNewPassword"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Confirm password does not match",
    path: ["confirmNewPassword"],
  });

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(MIN_NAME_LEN, "Name must contain at least 1 character(s)"),
    email: emailSchema,
    password: passwordSchema,
    googleId: z.string().trim().min(1).optional(),
    provider: z.enum(["local", "google"]),
    confirmPassword: z.string().trim().min(1).optional(),
    avatar: z.string().optional(),
  })
  .refine((data) => data.googleId || data.password, {
    message: "Invalid authentication method",
    path: ["password", "googleId"],
  })
  .refine(
    (data) => data.provider === "local" && data.password && !data.googleId,
    {
      message: "Invalid authentication method",
      path: ["password", "googleId"],
    },
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password does not match",
    path: ["confirmPassword"],
  });
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const updatePasswordSchema = z
  .object({
    newPassword: requiredPasswordSchema("newPassword"),
    confirmNewPassword: requiredPasswordSchema("confirmNewPassword"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Confirm password does not match",
    path: ["confirmNewPassword"],
  });

export type EmailSchemaType = z.infer<typeof emailSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
