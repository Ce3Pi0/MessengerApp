import { z } from "zod";

export const sendMessageSchema = z
  .object({
    chatId: z.string().trim().min(1),
    content: z.string().trim().optional(),
    image: z.string().trim().optional(),
    replyToId: z.string().trim().optional(),
  })
  .refine((data) => data.content || data.image, {
    message: "Either content or image must be provided",
    path: ["content"],
  });

export const editMessageSchema = z.object({
  chatId: z.string().trim().min(1),
  messageId: z.string().trim().min(1),
  content: z.string().trim(),
});

export const readMessageSchema = z.object({
  chatId: z.string().trim().min(1),
  messageId: z.string().trim().min(1),
});

export const deleteMessageSchema = z.object({
  chatId: z.string().trim().min(1),
  messageId: z.string().trim().min(1),
});

export type SendMessageSchemaType = z.infer<typeof sendMessageSchema>;
export type EditMessageSchemaType = z.infer<typeof editMessageSchema>;
export type ReadMessageSchemaType = z.infer<typeof readMessageSchema>;
export type DeleteMessageSchemaType = z.infer<typeof deleteMessageSchema>;
