import jwt, { JwtPayload } from "jsonwebtoken";
import { Env } from "../config/env.config";

type Time = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;

export const signConfirmToken = (user: any) => {
  const expiresIn = Env.JWT_ACCESS_EXPIRES_IN as Time;

  return jwt.sign({ id: user._id }, Env.JWT_VERIFY_SECRET, {
    audience: ["user"],
    expiresIn,
  });
};

export const signAccessToken = (user: any) => {
  const expiresIn = Env.JWT_ACCESS_EXPIRES_IN as Time;

  return jwt.sign(
    { id: user._id, provider: user.provider },
    Env.JWT_ACCESS_SECRET,
    {
      audience: ["user"],
      expiresIn,
    },
  );
};

export const signRefreshToken = (user: any) => {
  const expiresIn = Env.JWT_REFRESH_EXPIRES_IN as Time;

  return jwt.sign({ id: user._id }, Env.JWT_REFRESH_SECRET, {
    audience: ["user"],
    expiresIn,
  });
};

export const signForgotPasswordToken = (user: any) => {
  const expiresIn = Env.JWT_ACCESS_EXPIRES_IN as Time;

  return jwt.sign({ id: user._id }, Env.JWT_FORGOT_PASSWORD_SECRET, {
    audience: ["user"],
    expiresIn,
  });
};

export const signMfaToken = (user: any) => {
  const expiresIn = Env.JWT_ACCESS_EXPIRES_IN as Time;

  return jwt.sign({ id: user._id, type: "mfa_pending" }, Env.JWT_MFA_SECRET, {
    expiresIn,
  });
};

export const jwtVerify = (token: string, secret: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};
