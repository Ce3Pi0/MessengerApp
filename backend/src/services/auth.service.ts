import jwt, { JwtPayload } from "jsonwebtoken";
import { Profile } from "passport-google-oauth20";
import UserModel from "../models/user.model";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotAllowedException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "../utils/app-error";
import { compareVal, hashPass, hashToken } from "../utils/bcrypt";
import {
  signAccessToken,
  signConfirmToken,
  signRefreshToken,
} from "../utils/jwt-tokens";
import {
  ChangePasswordSchema,
  EmailSchemaType,
  LoginSchemaType,
  RegisterSchemaType,
} from "../validators/auth.validator";
import { findByIdUserService } from "./user.service";
import { Env } from "../config/env.config";
import { sendMail } from "../utils/sendMail";
import validate from "deep-email-validator";

export const googleAuthService = async (body: Profile) => {
  const profile: Profile = body;

  let user = await UserModel.findOne({
    googleId: profile.id,
  });

  const otherUser = await UserModel.findOne({
    email: profile.emails?.[0]?.value,
  });

  if (otherUser && otherUser.provider !== "google") {
    await otherUser.updateOne({
      $set: {
        googleId: profile.id,
        provider: "merged",
        isVerified: true,
      },
    });

    user = otherUser;
  }

  if (!user) {
    user = new UserModel({
      name: profile.displayName,
      email: profile.emails?.[0]?.value || "",
      googleId: profile.id,
      provider: "google",
      isVerified: true,
      avatar: profile.photos?.[0]?.value || "",
    });
  }

  return user;
};

export const googleAuthLoginService = async (
  user: Express.User,
  oldAccessToken: string | null,
  oldRefreshToken: string | null,
) => {
  if (oldAccessToken) {
    const payload = jwt.verify(
      oldAccessToken,
      Env.JWT_ACCESS_SECRET,
    ) as JwtPayload;

    const oldUser = await UserModel.findById(payload.id);

    if (oldUser?.email !== user.email)
      return {
        errorMsg: encodeURIComponent(
          "Google account email does not match your local account.",
        ),
        accessToken: "",
        refreshToken: "",
      };
  }

  await user.save();

  if (!user) throw new NotFoundException("User email not found");

  const accessToken = oldAccessToken ? oldAccessToken : signAccessToken(user);
  const refreshToken = oldRefreshToken
    ? oldRefreshToken
    : signRefreshToken(user);

  if (!oldRefreshToken) {
    const hashedRefreshToken: string = await hashToken(refreshToken);
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { refreshToken: hashedRefreshToken } },
    );
  }

  return {
    errorMsg: null,
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

  const validEmail: boolean = (await validate(newUser.email)).valid;

  if (!validEmail) throw new BadRequestException("Invalid email address");

  const confirmToken: string = signConfirmToken(newUser);

  sendMail({
    from: Env.SENDER_EMAIL,
    to: newUser.email,
    subject: `Verify You New Account ${newUser.name}`,
    text: `This token will expire in 15 minutes!: ${Env.API_URL}/auth/verify/${confirmToken}`,
  });

  await newUser.save();

  return newUser;
};

export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;

  const user = await UserModel.findOne({ email });

  if (!user) throw new NotFoundException("User email not found");

  if (!user.isVerified)
    throw new UnauthorizedException("User account not confirmed");

  if (user.provider === "google")
    throw new BadRequestException("Google account does not have a password");

  const isPasswordValid = await user.comparePassword(password!);

  if (!isPasswordValid) throw new UnauthorizedException("Invalid Password");

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const hashedRefreshToken: string = await hashToken(refreshToken);
  await UserModel.updateOne(
    { _id: user._id },
    { $set: { refreshToken: hashedRefreshToken } },
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const logoutUserService = async (refreshToken: string, id: string) => {
  if (refreshToken) {
    const user = await findByIdUserService(id);
    if (user) {
      await UserModel.updateOne(
        { _id: user._id },
        { $unset: { refreshToken: "" } },
      );
    }
  }
};

export const refreshService = async (refreshToken: string) => {
  const payload = jwt.verify(
    refreshToken,
    Env.JWT_REFRESH_SECRET,
  ) as JwtPayload;

  const user = await findByIdUserService(payload.id);

  if (!user) throw new ForbiddenException();

  const isValid = await compareVal(refreshToken, user.refreshToken!);

  if (!isValid) throw new UnauthorizedException();

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  const hashedRefreshToken: string = await hashToken(newRefreshToken);
  await UserModel.updateOne(
    { _id: user._id },
    { $set: { refreshToken: hashedRefreshToken } },
  );

  return { newAccessToken, newRefreshToken };
};

export const verifyService = async (verifyToken: string) => {
  const payload = jwt.verify(verifyToken, Env.JWT_VERIFY_SECRET) as JwtPayload;

  const user = await UserModel.findById(payload.id);

  if (!user) throw new NotFoundException("User not found");

  if (user.isVerified)
    throw new NotAllowedException("User is already verified");

  await UserModel.updateOne(
    { _id: payload.id },
    {
      $set: {
        isVerified: true,
      },
    },
  );
};

export const resendVerifyService = async (userEmail: EmailSchemaType) => {
  const user = await UserModel.findOne({ email: userEmail });

  if (!user) throw new NotFoundException("User not found");

  if (user.isVerified)
    throw new NotAllowedException("User is already verified");

  const confirmToken: string = signConfirmToken(user);

  sendMail({
    from: Env.SENDER_EMAIL,
    to: user.email,
    subject: `Verify You New Account ${user.name}`,
    text: `This token will expire in 15 minutes!: ${Env.API_URL}/auth/verify/${confirmToken}`,
  });
};

export const changePasswordService = async (
  body: ChangePasswordSchema,
  id: string,
) => {
  const user = await UserModel.findOne({ _id: id });

  if (!user) throw new NotFoundException("User not found");

  if (user.provider === "google")
    throw new UnprocessableEntityException("Google account not merged");

  const { currentPassword, newPassword } = body;

  const isValid = await user.comparePassword(currentPassword);

  if (!isValid) throw new UnauthorizedException("Wrong password");

  if (currentPassword === newPassword)
    throw new BadRequestException("Current and new passwords cannot match");

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  const hashedRefreshToken: string = await hashToken(newRefreshToken);
  const hashedPass: string = await hashPass(newPassword);

  await UserModel.updateOne(
    { _id: user._id },
    {
      $set: {
        password: hashedPass,
        refreshToken: hashedRefreshToken,
      },
    },
  );

  return { newAccessToken, newRefreshToken };
};
