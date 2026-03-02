import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTP_STATUS } from "../config/http.config";
import {
  getSingleUserService,
  getUsersService,
  updateUserService,
} from "../services/user.service";
import { BadRequestException } from "../utils/app-error";
import { updateUserSchema } from "../validators/user.validator";

export const getUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const cursor = req.query.cursor as string | undefined;

    const { users, nextCursor } = await getUsersService(userId, cursor);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Users retrieved successfully", nextCursor, users });
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
