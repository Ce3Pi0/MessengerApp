import { NextFunction, Request, Response } from "express";
import { Env } from "../config/env.config";
import { HTTP_STATUS } from "../config/http.config";
import { jwtVerify } from "../utils/jwt-tokens";

export const blockIfAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken: string = req.cookies.accessToken;
  const refreshToken: string = req.cookies.refreshToken;
  if (!accessToken && !refreshToken) return next();

  try {
    jwtVerify(refreshToken, Env.JWT_REFRESH_SECRET);
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: "Already authenticated" });
  } catch {
    return next();
  }
};
