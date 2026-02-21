import { z } from "zod";

const MIN_NAME_LEN: number = 1;
const MIN_EMAIL_LEN: number = 5;
const MIN_PASSWORD_LEN: number = 10;

export const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .min(MIN_EMAIL_LEN, `Invalid email length | min length: ${MIN_EMAIL_LEN}`);

export const passwordSchema = z
  .string()
  .trim()
  .min(
    MIN_PASSWORD_LEN,
    `Invalid password length | min length: ${MIN_PASSWORD_LEN}`,
  );

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_NAME_LEN, "Name must contain at least 1 character(s)"),
  email: emailSchema,
  password: passwordSchema,
  avatar: z.string().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
