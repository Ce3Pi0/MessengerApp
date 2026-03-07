import { z } from "zod";

const MIN_NAME_LEN: number = 1;
const MIN_EMAIL_LEN: number = 5;
const MIN_PASSWORD_LEN: number = 10;

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(MIN_NAME_LEN, "Name must contain at least 1 character(s)"),
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .min(
        MIN_EMAIL_LEN,
        `Invalid email length | min length: ${MIN_EMAIL_LEN}`,
      ),
    password: z
      .string()
      .trim()
      .min(
        MIN_PASSWORD_LEN,
        `Invalid password length-min: ${MIN_PASSWORD_LEN}`,
      ),
    confirmPassword: z
      .string()
      .trim()
      .min(
        MIN_PASSWORD_LEN,
        `Invalid password length-min: ${MIN_PASSWORD_LEN}`,
      ),
    provider: z.enum(["local", "google"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password does not match",
    path: ["confirmPassword"],
  });

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .min(MIN_EMAIL_LEN, `Invalid email length | min length: ${MIN_EMAIL_LEN}`),
  password: z
    .string()
    .trim()
    .min(MIN_PASSWORD_LEN, `Invalid password length-min: ${MIN_PASSWORD_LEN}`),
});

export const changePasswordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(
        MIN_PASSWORD_LEN,
        `Invalid password length-min: ${MIN_PASSWORD_LEN}`,
      ),
    newPassword: z
      .string()
      .trim()
      .min(
        MIN_PASSWORD_LEN,
        `Invalid password length-min: ${MIN_PASSWORD_LEN}`,
      ),
    confirmNewPassword: z
      .string()
      .trim()
      .min(
        MIN_PASSWORD_LEN,
        `Invalid password length-min: ${MIN_PASSWORD_LEN}`,
      ),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Current password and new password cannot be the same",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Confirm password does not match",
    path: ["confirmNewPassword"],
  });

export const setPasswordFormSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(
        MIN_PASSWORD_LEN,
        `Invalid password length-min: ${MIN_PASSWORD_LEN}`,
      ),
    confirmPassword: z
      .string()
      .trim()
      .min(
        MIN_PASSWORD_LEN,
        `Invalid password length-min: ${MIN_PASSWORD_LEN}`,
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password does not match",
    path: ["confirmPassword"],
  });

export const updatePasswordFormSchema = z.object({
  newPassword: z
    .string()
    .trim()
    .min(MIN_PASSWORD_LEN, `Invalid password length-min: ${MIN_PASSWORD_LEN}`),
  confirmNewPassword: z
    .string()
    .trim()
    .min(MIN_PASSWORD_LEN, `Invalid password length-min: ${MIN_PASSWORD_LEN}`),
});

export type RegisterFormSchemaType = z.infer<typeof registerFormSchema>;
export type LoginFormSchemaType = z.infer<typeof loginFormSchema>;
export type ChangePasswordFormSchemaType = z.infer<
  typeof changePasswordFormSchema
>;
export type SetPasswordFormSchemaType = z.infer<typeof setPasswordFormSchema>;
export type UpdatePasswordFormSchemaType = z.infer<
  typeof updatePasswordFormSchema
>;
