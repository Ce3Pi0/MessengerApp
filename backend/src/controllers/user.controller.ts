import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTP_STATUS } from "../config/http.config";
import { getUsersService } from "../services/user.service";
import { transporter } from "../config/nodemailer.config";

export const getUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const users = await getUsersService(userId);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Users retrieved successfully", users });
  },
);
