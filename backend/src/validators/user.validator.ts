import z from "zod";

const MIN_NAME_LEN: number = 1;

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(MIN_NAME_LEN, "Name must contain at least 1 character(s)")
      .optional(),
    avatar: z.string().optional(),
  })
  .refine((data) => data.name || data.avatar, {
    message: "You must provide name or avatar",
    path: ["name", "avatar"],
  });

export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
