import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/app-error";
import { jwtVerify } from "../utils/jwt-tokens";
import { Env } from "../config/env.config";

export const restrictToMfaPending = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.mfaToken;

  if (!token) throw new UnauthorizedException("MFA session missing");

  const payload = jwtVerify(token, Env.JWT_MFA_SECRET);

  if (payload.type !== "mfa_pending") {
    throw new UnauthorizedException("Invalid session type");
  }

  req.userId = payload.id;

  next();
};
