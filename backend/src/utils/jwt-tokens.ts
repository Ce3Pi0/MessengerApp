import jwt from "jsonwebtoken";
import { UserDocument } from "../models/user.model";
import { Env } from "../config/env.config";

type Time = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;

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

  return jwt.sign(
    { id: user._id, provider: user.provider },
    Env.JWT_REFRESH_SECRET,
    {
      audience: ["user"],
      expiresIn,
    },
  );
};
