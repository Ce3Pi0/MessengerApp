import { z } from "zod";

export const sendReactionSchema = z.object({
  chatId: z.string().trim().min(1),
  messageId: z.string().trim().min(1),
  emoji: z.string().emoji(),
});

export const deleteReactionSchema = z.object({
  reactionId: z.string().trim().min(1),
  chatId: z.string().trim().min(1),
  messageId: z.string().trim().min(1),
});

export type SendReactionSchemaType = z.infer<typeof sendReactionSchema>;
export type DeleteReactionSchemaType = z.infer<typeof deleteReactionSchema>;
