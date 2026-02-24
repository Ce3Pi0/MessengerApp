import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { loginService, registerService } from "../services/auth.service";
import { clearJwtAuthCookie, setJwtAuthCookie } from "../utils/cookie";
import { HTTP_STATUS } from "../config/http.config";
import { findByIdUserService } from "../services/user.service";
import { ForbiddenException, UnauthorizedException } from "../utils/app-error";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Env } from "../config/env.config";
import { compareVal, hashToken } from "../utils/bcrypt";
import { signAccessToken, signRefreshToken } from "../utils/jwt-tokens";
import UserModel from "../models/user.model";

export const googleAuthController = asyncHandler(
  async (req: Request, res: Response) => {
    // Google authentication logic would go here
    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Google authentication successful" });
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

    const { accessToken, refreshToken } = await loginService(body);

    return setJwtAuthCookie(res, accessToken, refreshToken)
      .status(HTTP_STATUS.OK)
      .json({
        message: "User login successful",
      });
  },
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const user = await findByIdUserService(req.user?._id);
      if (user) {
        await UserModel.updateOne(
          { _id: user._id },
          { $unset: { refreshToken: "" } },
        );
      }
    }

    clearJwtAuthCookie(res);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "User logged out successfully" });
  },
);

export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken: string = req.cookies.refreshToken;

    if (!refreshToken) throw new UnauthorizedException();

    const payload = jwt.verify(
      refreshToken,
      Env.JWT_REFRESH_SECRET,
    ) as JwtPayload;

    const user = await findByIdUserService(payload.id);

    if (!user) throw new ForbiddenException();

    const isValid = await compareVal(refreshToken, user.refreshToken!);

    if (!isValid) throw new UnauthorizedException();

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    const hashedRefreshToken: string = await hashToken(newRefreshToken);
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { refreshToken: hashedRefreshToken } },
    );

    setJwtAuthCookie(res, newAccessToken, newRefreshToken).json({
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
