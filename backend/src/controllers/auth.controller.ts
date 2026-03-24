import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  changePasswordSchema,
  emailSchema,
  loginSchema,
  registerSchema,
  setPasswordSchema,
  updatePasswordSchema,
} from "../validators/auth.validator";
import {
  changePasswordService,
  disable2faService,
  enable2faService,
  forgotPasswordService,
  googleAuthLoginService,
  loginService,
  logoutUserService,
  refreshService,
  registerService,
  resendVerifyService,
  sendForgotPasswordService,
  setPasswordService,
  updatePasswordService,
  verify2faService,
  verifyService,
} from "../services/auth.service";
import { clearJwtAuthCookie, setJwtAuthCookie } from "../utils/cookie";
import { HTTP_STATUS } from "../config/http.config";
import {
  BadRequestException,
  InternalServerException,
  UnauthorizedException,
} from "../utils/app-error";
import { Env } from "../config/env.config";

export const googleAuthController = asyncHandler(
  async (req: Request, res: Response) => {
    const { errorMsg, accessToken, refreshToken, mfaToken, mfaRequired } =
      await googleAuthLoginService(
        req.user!,
        req.cookies.accessToken,
        req.cookies.refreshToken,
      );

    if (errorMsg) {
      return res.redirect(
        `${Env.FRONTEND_URL}/linking-error?message=${errorMsg}`,
      );
    }

    const redirectUrl: string = mfaRequired
      ? Env.FRONTEND_URL + "/2fa"
      : Env.FRONTEND_URL + "/chat";

    return setJwtAuthCookie(res, accessToken, refreshToken, mfaToken).redirect(
      HTTP_STATUS.FOUND,
      redirectUrl,
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

    const { user, mfaRequired, mfaToken, accessToken, refreshToken } =
      await loginService(body);

    return setJwtAuthCookie(res, accessToken, refreshToken, mfaToken)
      .status(HTTP_STATUS.OK)
      .json({
        message: "User login successful",
        mfaRequired,
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

export const verifyController = asyncHandler(
  async (req: Request, res: Response) => {
    const verifyToken = req.params.token as string;

    if (!verifyToken)
      throw new UnauthorizedException("Verification token not specified");

    await verifyService(verifyToken);

    return res.redirect(HTTP_STATUS.FOUND, `${Env.FRONTEND_URL}/`);
  },
);

export const resendVerifyController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.body.email) throw new UnauthorizedException("Email not specified");

    const email: string = emailSchema.parse(req.body.email);

    await resendVerifyService(email);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Verification email sent successfully" });
  },
);

export const setPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = setPasswordSchema.parse(req.body);

    const { user, newAccessToken, newRefreshToken } = await setPasswordService(
      body,
      req.user!._id,
    );

    return setJwtAuthCookie(res, newAccessToken, newRefreshToken)
      .status(HTTP_STATUS.OK)
      .json({
        message: "Password set successfully",
        user,
      });
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

export const sendForgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.body.email) throw new UnauthorizedException("Email not specified");

    const email: string = emailSchema.parse(req.body.email);

    await sendForgotPasswordService(email);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Reset password email sent successfully" });
  },
);

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const forgotPasswordToken = req.params.token as string;

    if (!forgotPasswordToken)
      throw new UnauthorizedException("Verification token not specified");

    await forgotPasswordService(forgotPasswordToken);

    return res.redirect(
      HTTP_STATUS.FOUND,
      `${Env.FRONTEND_URL}/forgot-password?token=${forgotPasswordToken}`,
    );
  },
);

export const updatePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const forgotPasswordToken = req.params.token as string;

    if (!forgotPasswordToken)
      throw new UnauthorizedException("Verification token not specified");

    if (!req.body) throw new UnauthorizedException("Body not specified");

    const body = updatePasswordSchema.parse(req.body);

    await updatePasswordService(body, forgotPasswordToken);

    return res.status(HTTP_STATUS.OK).json({
      message: "Password updated successfully",
    });
  },
);

export const linkAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    return res.redirect(
      HTTP_STATUS.FOUND,
      `${Env.API_URL}${Env.API_VERSION}${Env.GOOGLE_URL}`,
    );
  },
);

export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken: string = req.cookies.refreshToken;

    if (!refreshToken) throw new UnauthorizedException("Missing refresh token");

    const { user, newAccessToken, newRefreshToken, chats, next } =
      await refreshService(refreshToken);

    return setJwtAuthCookie(res, newAccessToken, newRefreshToken).json({
      message: "Refreshed",
      user,
      chats,
      next,
    });
  },
);

export const enable2faController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) throw new UnauthorizedException("User not found");

    const data: string = await enable2faService(user);

    if (!data) throw new InternalServerException("QR Code generation issue");

    return res.status(HTTP_STATUS.OK).json({
      qrCode: data,
    });
  },
);

export const disable2faController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) throw new UnauthorizedException("User not found");

    await disable2faService(user);

    return res.status(HTTP_STATUS.OK).json({
      message: "2FA disabled successfully",
    });
  },
);

export const verify2faController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) throw new BadRequestException("User Id not provided");

    const otp: string = req.body.otp as string;

    if (!otp) throw new BadRequestException("OTP not provided");

    const { user, accessToken, refreshToken } = await verify2faService(
      userId,
      otp,
    );

    setJwtAuthCookie(res, accessToken, refreshToken)
      .status(HTTP_STATUS.OK)
      .json({
        message: "2FA verified successfully",
        user,
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
