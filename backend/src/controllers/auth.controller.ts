import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from "../validators/auth.validator";
import {
  changePasswordService,
  googleAuthLoginService,
  loginService,
  logoutUserService,
  refreshService,
  registerService,
} from "../services/auth.service";
import { clearJwtAuthCookie, setJwtAuthCookie } from "../utils/cookie";
import { HTTP_STATUS } from "../config/http.config";
import { UnauthorizedException } from "../utils/app-error";
import { Env } from "../config/env.config";

export const googleAuthController = asyncHandler(
  async (req: Request, res: Response) => {
    const { errorMsg, accessToken, refreshToken } =
      await googleAuthLoginService(
        req.user!,
        req.cookies.accessToken,
        req.cookies.refreshToken,
      );

    if (errorMsg) {
      return res.redirect(`${Env.FRONTEND_URL}/settings?error=${errorMsg}`);
    }

    return setJwtAuthCookie(res, accessToken, refreshToken).redirect(
      HTTP_STATUS.FOUND,
      Env.FRONTEND_URL,
    );
  },
);

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const user = await registerService(body);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "User created successful",
      user,
    });
  },
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);

    const { user, accessToken, refreshToken } = await loginService(body);

    return setJwtAuthCookie(res, accessToken, refreshToken)
      .status(HTTP_STATUS.OK)
      .json({
        message: "User login successful",
        user,
      });
  },
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    await logoutUserService(refreshToken, req.user!._id);

    clearJwtAuthCookie(res);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "User logged out successfully" });
  },
);

export const changePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = changePasswordSchema.parse(req.body);

    const { newAccessToken, newRefreshToken } = await changePasswordService(
      body,
      req.user!._id,
    );

    return setJwtAuthCookie(res, newAccessToken, newRefreshToken)
      .status(HTTP_STATUS.OK)
      .json({
        message: "Password changed successfully",
      });
  },
);

export const linkAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    return res.redirect(HTTP_STATUS.FOUND, Env.GOOGLE_URL);
  },
);

export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken: string = req.cookies.refreshToken;

    if (!refreshToken) throw new UnauthorizedException("Missing refresh token");

    const { newAccessToken, newRefreshToken } =
      await refreshService(refreshToken);

    return setJwtAuthCookie(res, newAccessToken, newRefreshToken).json({
      message: "Refreshed",
    });
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
