import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Env } from "../config/env.config";
import { HTTP_STATUS } from "../config/http.config";
import UserModel from "../models/user.model";

export const blockIfGoogleAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken: string = req.cookies.accessToken;

  if (!accessToken) return next();

  try {
    const payload = jwt.verify(
      accessToken,
      Env.JWT_ACCESS_SECRET,
    ) as JwtPayload;

    if (payload.provider !== "local")
      return res
        .status(HTTP_STATUS.NOT_ALLOWED)
        .json({ message: "Already authenticated with a google account" });
    return next();
  } catch {
    return next();
  }
};
