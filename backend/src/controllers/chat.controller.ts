import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTP_STATUS } from "../config/http.config";
import { chatIdSchema, createChatSchema } from "../validators/chat.validator";
import {
  createChatService,
  getSingleChatService,
  getUserChatService,
} from "../services/chats.service";

export const createChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createChatSchema.parse(req.body);

    const chat = await createChatService(userId, body);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Chat created successfully", chat });
  },
);

export const getUserChatsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const chats = await getUserChatService(userId);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Chats retrieved successfully", chats });
  },
);

export const getSingleChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { id } = chatIdSchema.parse(req.params);

    const { chat, messages } = await getSingleChatService(id, userId);

    return res.status(HTTP_STATUS.OK).json({
      message: "Chat and messages retrieved successfully",
      chat,
      messages,
    });
  },
);
