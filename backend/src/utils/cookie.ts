import jwt from "jsonwebtoken";
import { Response } from "express";
import { Env } from "../config/env.config";

export const setJwtAuthCookie = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie("accessToken", accessToken, {
    maxAge: 15 * 60 * 1000,
    httpOnly: true,
    path: "/",
    secure: Env.NODE_ENV === "production" ? true : false,
    sameSite: Env.NODE_ENV === "production" ? "strict" : "lax",
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    path: "/",
    secure: Env.NODE_ENV === "production" ? true : false,
    sameSite: Env.NODE_ENV === "production" ? "strict" : "lax",
  });

  return res;
};

export const clearJwtAuthCookie = (res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};
