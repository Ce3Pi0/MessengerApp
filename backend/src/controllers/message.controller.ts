import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  sendMessageSchema,
  editMessageSchema,
  deleteMessageSchema,
} from "../validators/message.validator";
import { HTTP_STATUS } from "../config/http.config";
import {
  sendMessageService,
  editMessageService,
  deleteMessageService,
} from "../services/message.service";

export const sendMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId: string = req.user?._id;
    const body = sendMessageSchema.parse(req.body);

    const result = await sendMessageService(userId, body);

    return res.status(HTTP_STATUS.OK).json({
      message: "Message sent successfully",
      ...result,
    });
  },
);

export const editMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId: string = req.user?._id;
    const body = editMessageSchema.parse(req.body);

    const result = await editMessageService(userId, body);

    return res.status(HTTP_STATUS.OK).json({
      message: "Message edited successfully",
      ...result,
    });
  },
);

export const deleteMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId: string = req.user?._id;
    const body = deleteMessageSchema.parse(req.body);

    const result = await deleteMessageService(userId, body);

    return res.status(HTTP_STATUS.OK).json({
      message: "Message deleted successfully",
      ...result,
    });
  },
);
