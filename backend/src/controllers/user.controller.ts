import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTP_STATUS } from "../config/http.config";
import {
  addFavoriteUserService,
  blockUserService,
  getSingleUserService,
  getUsersService,
  removeFavoriteUserService,
  unblockUserService,
  updateUserService,
} from "../services/user.service";
import { BadRequestException } from "../utils/app-error";
import { updateUserSchema } from "../validators/user.validator";
import { deleteUserService } from "../services/user.service";
import { clearJwtAuthCookie } from "../utils/cookie";

export const getUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const cursor = req.query.cursor as string | undefined;

    const { users, nextCursor } = await getUsersService(userId, cursor);

    return res.status(HTTP_STATUS.OK).json({
      message: "Users retrieved successfully",
      next: nextCursor,
      users,
    });
  },
);

export const getSingleUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.id as string;
    const currentUserId = req.user?._id;

    if (!userId) throw new BadRequestException("Invalid user ID");

    const user = await getSingleUserService(currentUserId, userId);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "User retrieved successfully", user });
  },
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = updateUserSchema.parse(req.body);

    if (!userId) throw new BadRequestException("Invalid user ID");

    const user = await updateUserService(userId, body);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "User updated successfully", user });
  },
);

export const addFavoriteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { chatToBeFavoriteId } = req.body;

    const favorites = await addFavoriteUserService(userId, chatToBeFavoriteId);

    return res.status(HTTP_STATUS.OK).json({
      message: "Chat favorited successfully",
      favorites,
    });
  },
);

export const removeFavoriteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { chatToBeUnfavoriteId } = req.body;

    const favorites = await removeFavoriteUserService(
      userId,
      chatToBeUnfavoriteId,
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "Chat favorited successfully",
      favorites,
    });
  },
);

export const blockUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { userToBeBlockedId } = req.body;

    await blockUserService(userId, userToBeBlockedId);

    return res.status(HTTP_STATUS.OK).json({
      message: "User blocked successfully",
    });
  },
);

export const unblockUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { userToBeUnblockedId } = req.body;

    const chat = await unblockUserService(userId, userToBeUnblockedId);

    return res.status(HTTP_STATUS.OK).json({
      message: "User unblocked successfully",
      chat,
    });
  },
);

export const deleteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id;

    await deleteUserService(userId);

    clearJwtAuthCookie(res);

    return res.status(HTTP_STATUS.OK).json({
      message: "User deleted successfully",
    });
  },
);
