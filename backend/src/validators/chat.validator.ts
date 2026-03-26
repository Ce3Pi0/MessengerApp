import { z } from "zod";

export const createChatSchema = z.object({
  participantId: z.string().trim().min(1).optional(),
  isGroup: z.boolean().optional(),
  participants: z.array(z.string().trim().min(1)).optional(),
  groupName: z.string().trim().min(1).optional(),
});

export const chatIdSchema = z.object({
  id: z.string().trim().min(1),
});

export const removeUserFromChatSchema = z.object({
  userToRemoveId: z.string().trim().min(1),
  chatId: z.string().trim().min(1),
});

export const addUserToChatSchema = z.object({
  chatId: z.string().trim().min(1),
  participantId: z.string().trim().min(1),
});

export const updateChatSchema = z
  .object({
    groupName: z.string().trim().min(1).optional(),
    avatar: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.groupName || data.avatar, {
    message: "groupName or img are required",
  });

export const promoteUserSchema = z.object({
  userToBePromotedId: z.string().trim().min(1),
});

export type UpdateChatSchemaType = z.infer<typeof updateChatSchema>;
