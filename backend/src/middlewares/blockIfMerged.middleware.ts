import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Env } from "../config/env.config";
import { HTTP_STATUS } from "../config/http.config";
import UserModel from "../models/user.model";

export const blockIfMerged = (
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

    if (payload.provider === "merged")
      return res
        .status(HTTP_STATUS.NOT_ALLOWED)
        .json({ message: "Account already merged" });
    return next();
  } catch (error) {
    return next();
  }
};
