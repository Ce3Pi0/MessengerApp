import { Response } from "express";
import { Env } from "../config/env.config";

const ACCESS_TOKEN_MAX_AGE: number = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE: number = 7 * 24 * 60 * 60 * 1000;

export const setJwtAuthCookie = (
  res: Response,
  accessToken?: string,
  refreshToken?: string,
  mfaToken: string = "",
) => {
  if (accessToken)
    res.cookie("accessToken", accessToken, {
      maxAge: ACCESS_TOKEN_MAX_AGE,
      httpOnly: true,
      path: "/",
      secure: Env.NODE_ENV === "production" ? true : false,
      sameSite: Env.NODE_ENV === "production" ? "strict" : "lax",
    });

  if (refreshToken)
    res.cookie("refreshToken", refreshToken, {
      maxAge: REFRESH_TOKEN_MAX_AGE,
      httpOnly: true,
      path: "/",
      secure: Env.NODE_ENV === "production" ? true : false,
      sameSite: Env.NODE_ENV === "production" ? "strict" : "lax",
    });

  if (mfaToken)
    res.cookie("mfaToken", mfaToken, {
      maxAge: ACCESS_TOKEN_MAX_AGE,
      httpOnly: true,
      path: "/",
      secure: Env.NODE_ENV === "production" ? true : false,
      sameSite: Env.NODE_ENV === "production" ? "strict" : "lax",
    });
  else res.clearCookie("mfaToken", { path: "/" });

  return res;
};

export const clearJwtAuthCookie = (res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};
