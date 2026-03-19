import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTP_STATUS } from "../config/http.config";
import {
  deleteReactionService,
  sendReactionService,
} from "../services/reaction.service";
import {
  deleteReactionSchema,
  sendReactionSchema,
} from "../validators/reaction.validators";

export const sendReactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId: string = req.user?._id;
    const body = sendReactionSchema.parse(req.body);

    const result = await sendReactionService(userId, body);

    return res.status(HTTP_STATUS.OK).json({
      message: "Reaction sent successfully",
      ...result,
    });
  },
);

export const deleteReactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId: string = req.user?._id;
    const body = deleteReactionSchema.parse(req.body);

    const result = await deleteReactionService(userId, body);

    return res.status(HTTP_STATUS.OK).json({
      message: "Reaction deleted successfully",
      ...result,
    });
  },
);
