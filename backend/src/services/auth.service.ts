import { Profile } from "passport-google-oauth20";
import UserModel from "../models/user.model";
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/app-error";
import { hashToken } from "../utils/bcrypt";
import { signAccessToken, signRefreshToken } from "../utils/jwt-tokens";
import {
  LoginSchemaType,
  RegisterSchemaType,
} from "../validators/auth.validator";

export const googleAuthRegisterService = async (body: Profile) => {
  const profile: Profile = body;
  let user = await UserModel.findOne({
    googleId: profile.id,
  });

  if (!user) {
    user = new UserModel({
      name: profile.displayName,
      email: profile.emails?.[0]?.value || "",
      googleId: profile.id,
      provider: "google",
    });
    await user.save();
    console.log("New User:", user);
  }
  return user;
};

export const googleAuthLoginService = async (body: Express.User) => {
  console.log("Google User:", body);

  const existingUser = await UserModel.findOne({ _id: body.id });

  if (!existingUser) throw new NotFoundException("User email not found");
  const accessToken = signAccessToken(existingUser);
  const refreshToken = signRefreshToken(existingUser);

  const hashedRefreshToken: string = await hashToken(refreshToken);
  await UserModel.updateOne(
    { _id: existingUser._id },
    { $set: { refreshToken: hashedRefreshToken } },
  );

  return {
    existingUser,
    accessToken,
    refreshToken,
  };
};

export const registerService = async (body: RegisterSchemaType) => {
  const { email } = body;
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) throw new ConflictException("Email already in use");

  const newUser = new UserModel({
    ...body,
  });
  await newUser.save();

  return newUser;
};

export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;

  const existingUser = await UserModel.findOne({ email });

  if (!existingUser) throw new NotFoundException("User email not found");

  const isPasswordValid = await existingUser.comparePassword(password!);

  if (!isPasswordValid) throw new UnauthorizedException("Invalid Password");

  const accessToken = signAccessToken(existingUser);
  const refreshToken = signRefreshToken(existingUser);

  const hashedRefreshToken: string = await hashToken(refreshToken);
  await UserModel.updateOne(
    { _id: existingUser._id },
    { $set: { refreshToken: hashedRefreshToken } },
  );

  return {
    existingUser,
    accessToken,
    refreshToken,
  };
};
