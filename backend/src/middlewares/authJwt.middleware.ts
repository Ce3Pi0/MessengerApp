import { NextFunction, Request, Response } from "express";
import passport from "../config/passport.config";
import { UnauthorizedException } from "../utils/app-error";
export const passportAuthenticateJwt = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate(
    "jwt",
    {
      session: false,
    },
    (err: any, user: Express.User, info: any) => {
      console.log("HERE");

      if (info instanceof Error && info.name === "TokenExpiredError") {
        throw new UnauthorizedException("Token expired");
      }

      req.user = user;
      next();
    },
  )(req, res, next);
};
