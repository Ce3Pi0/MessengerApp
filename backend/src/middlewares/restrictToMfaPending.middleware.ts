import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/app-error";
import { jwtVerify } from "../utils/jwt-tokens";
import { Env } from "../config/env.config";

export const restrictToMfaPending = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies.accessToken;
  const mfaToken = req.cookies.mfaToken;

  if (!accessToken && !mfaToken)
    throw new UnauthorizedException("MFA session missing");

  const payload = accessToken
    ? jwtVerify(accessToken, Env.JWT_ACCESS_SECRET)
    : jwtVerify(mfaToken, Env.JWT_MFA_SECRET);

  req.userId = payload.id;

  next();
};
