import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTP_STATUS } from "../config/http.config";
import {
  addUserToChatSchema,
  chatIdSchema,
  createChatSchema,
  removeUserFromChatSchema,
  updateChatSchema,
} from "../validators/chat.validator";
import {
  addAdminChatService,
  addUserChatService,
  createChatService,
  deleteChatService,
  getSingleChatService,
  getUserChatService,
  removeUserFromChatService,
  updateChatService,
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
    const cursor = req.query.cursor as string | undefined;

    const { chats, next } = await getUserChatService(userId, cursor);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Chats retrieved successfully", chats, next });
  },
);

export const getSingleChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const cursor = req.query.cursor as string | undefined;
    const { id } = chatIdSchema.parse(req.params);

    const { chat, messages, next } = await getSingleChatService(
      id,
      userId,
      cursor,
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "Chat and messages retrieved successfully",
      chat,
      next,
      messages,
    });
  },
);

export const updateChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = updateChatSchema.parse(req.body);

    const updatedChat = await updateChatService(userId, body);

    return res.status(HTTP_STATUS.OK).json({
      message: "Chat updated successfully",
      updatedChat,
    });
  },
);

export const addAdminChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const chatId = req.params.id as string;

    const userToBePromotedId = req.body;

    const updatedChat = await addAdminChatService(
      userId,
      chatId,
      userToBePromotedId,
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "Admin added successfully",
      updatedChat,
    });
  },
);

export const deleteChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const chatId = req.params.id as string;

    await deleteChatService(userId, chatId);

    return res.status(HTTP_STATUS.OK).json({
      message: "Chat deleted successfully",
    });
  },
);

export const removeUserFromChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { userToRemoveId, chatId } = removeUserFromChatSchema.parse(req.body);

    await removeUserFromChatService(userId, userToRemoveId, chatId);

    return res.status(HTTP_STATUS.OK).json({
      message: "User removed successfully",
    });
  },
);

export const addUserChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { chatId, participantId } = addUserToChatSchema.parse(req.body);

    const updatedChat = await addUserChatService(userId, chatId, participantId);

    return res.status(HTTP_STATUS.OK).json({
      message: "User added successfully",
      updatedChat,
    });
  },
);
