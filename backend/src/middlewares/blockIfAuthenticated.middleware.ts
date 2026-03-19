import { NextFunction, Request, Response } from "express";
import { Env } from "../config/env.config";
import { HTTP_STATUS } from "../config/http.config";
import { jwtVerify } from "../utils/jwt-tokens";
import UserModel from "../models/user.model";
import { compareVal } from "../utils/bcrypt";

export const blockIfAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken: string = req.cookies.accessToken;
  const refreshToken: string = req.cookies.refreshToken;
  if (!accessToken && !refreshToken) return next();

  try {
    const payload = jwtVerify(refreshToken, Env.JWT_REFRESH_SECRET);

    const user = await UserModel.findById(payload.id);

    const isValid = await compareVal(refreshToken, user!.refreshToken!);

    if (isValid)
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "Already authenticated" });
    else next();
  } catch {
    return next();
  }
};
