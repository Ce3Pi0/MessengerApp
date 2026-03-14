import { z } from "zod";

export const messageSchema = z.object({
  message: z.string().optional(),
});

export type MessageSchemaType = z.infer<typeof messageSchema>;
