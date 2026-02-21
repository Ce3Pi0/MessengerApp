import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { loginService, registerService } from "../services/auth.service";
import { clearJwtAuthCookie, setJwtAuthCookie } from "../utils/cookie";
import { HTTP_STATUS, HTTP_STATUS_MESSAGE } from "../config/http.config";
import { ZodError } from "zod";
import { AppError, UnprocessableEntityException } from "../utils/app-error";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const user = await registerService(body);
    const userId = user._id.toString();

    return setJwtAuthCookie({ res, userId }).status(HTTP_STATUS.CREATED).json({
      message: "User created & login successful",
      user,
    });
  },
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);

    const user = await loginService(body);
    const userId = user._id.toString();

    return setJwtAuthCookie({ res, userId }).status(HTTP_STATUS.OK).json({
      message: "User logged in successful",
      user,
    });
  },
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    return clearJwtAuthCookie(res)
      .status(HTTP_STATUS.OK)
      .json({ message: "User logged out successfully" });
  },
);

export const authStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    return res.status(HTTP_STATUS.OK).json({
      message: "Authenticated User",
      user,
    });
  },
);
