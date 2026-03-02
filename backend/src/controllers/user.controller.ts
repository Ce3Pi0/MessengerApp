import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTP_STATUS } from "../config/http.config";
import { getUsersService } from "../services/user.service";
import { transporter } from "../config/nodemailer.config";

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
