import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { Profile } from "passport-google-oauth20";
import UserModel from "../models/user.model";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerException,
  NotAllowedException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "../utils/app-error";
import { compareVal, hashPass, hashToken } from "../utils/bcrypt";
import {
  jwtVerify,
  signAccessToken,
  signConfirmToken,
  signForgotPasswordToken,
  signMfaToken,
  signRefreshToken,
} from "../utils/jwt-tokens";
import {
  ChangePasswordSchema,
  EmailSchemaType,
  LoginSchemaType,
  RegisterSchemaType,
  SetPasswordSchemaType,
  UpdatePasswordSchema,
} from "../validators/auth.validator";
import { Env } from "../config/env.config";
import { sendMail } from "../utils/sendMail";
import emailValidator, { ValidationResult } from "node-email-verifier";
import cloudinary from "../config/cloudinary.config";
import { getUserChatService } from "./chats.service";
import { USER_POPULATE_CONFIG } from "../config/user-populate.config";
import { getEnv } from "../utils/get-env";

export const googleAuthService = async (body: Profile) => {
  const profile: Profile = body;

  let user = await UserModel.findOne({
    googleId: profile.id,
  });

  const systemId = getEnv("SYSTEM_USER_ID");

  const otherUser = await UserModel.findOne({
    email: profile.emails?.[0]?.value,
    _id: { $ne: systemId },
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

  await user.populate(USER_POPULATE_CONFIG);

  return user;
};

export const googleAuthLoginService = async (
  user: Express.User,
  curAccessToken: string | null,
  curRefreshToken: string | null,
) => {
  if (curAccessToken) {
    const payload = jwtVerify(curAccessToken, Env.JWT_ACCESS_SECRET);

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

  if (!user) throw new NotFoundException("User email not found");

  await user.save();

  if (user.enabled2fa) {
    const mfaToken = signMfaToken(user);

    return {
      errorMsg: null,
      mfaRequired: true,
      mfaToken,
    };
  }

  const accessToken = curAccessToken ? curAccessToken : signAccessToken(user);

  const refreshToken = curRefreshToken
    ? curRefreshToken
    : signRefreshToken(user);

  if (!curRefreshToken) {
    const hashedRefreshToken: string = await hashToken(refreshToken);
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { refreshToken: hashedRefreshToken } },
    );
  }

  return {
    errorMsg: null,
    mfaRequired: false,
    accessToken,
    refreshToken,
  };
};

export const registerService = async (body: RegisterSchemaType) => {
  const { email } = body;
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) throw new ConflictException("Email already in use");

  if (body.avatar) {
    const uploadRes = await cloudinary.uploader.upload(body.avatar);
    body.avatar = uploadRes.secure_url;
  }

  const newUser = new UserModel({
    name: body.name,
    password: body.password,
    email: body.email,
    avatar: body.avatar,
    provider: "local",
  });

  const validEmail = (await emailValidator(newUser.email!, {
    detailed: true,
    checkMx: true,
    timeout: "500ms",
  })) as ValidationResult;

  if (!validEmail.valid)
    throw new BadRequestException(`Invalid email address ${newUser.email}`);

  const confirmToken: string = signConfirmToken(newUser);

  sendMail({
    from: Env.SENDER_EMAIL,
    to: newUser.email!,
    subject: `Verify You New Account ${newUser.name}`,
    text: `This token will expire in 15 minutes!: ${Env.API_URL}${Env.API_VERSION}auth/verify/${confirmToken}`,
  });

  await newUser.save();

  return newUser;
};

export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;

  const systemId = getEnv("SYSTEM_USER_ID");

  const user = await UserModel.findOne({ email, _id: { $ne: systemId } });

  if (!user) throw new NotFoundException("User email not found");

  if (user.isAI) throw new BadRequestException("Invalid user");

  if (!user.isVerified)
    throw new UnauthorizedException("User account not confirmed");

  if (user.provider === "google")
    throw new BadRequestException("Google account does not have a password");

  if (user.forgotPassword) throw new UnauthorizedException("Password not set");

  const isPasswordValid = await user.comparePassword(password!);

  if (!isPasswordValid) throw new UnauthorizedException("Invalid Password");

  // Tokens get created on 2fa verification
  if (user.enabled2fa) {
    const mfaToken = signMfaToken(user);

    return {
      user: null,
      mfaToken,
      mfaRequired: true,
    };
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const hashedRefreshToken: string = await hashToken(refreshToken);
  const populatedUser = await UserModel.findOneAndUpdate(
    { _id: user._id },
    { $set: { refreshToken: hashedRefreshToken } },
  ).populate(USER_POPULATE_CONFIG);

  return {
    user: populatedUser,
    accessToken,
    refreshToken,
    mfaRequired: false,
  };
};

export const logoutUserService = async (refreshToken: string, id: string) => {
  if (refreshToken) {
    const user = await UserModel.findById(id);
    if (user) {
      await UserModel.updateOne(
        { _id: user._id },
        { $unset: { refreshToken: "" } },
      );
    }
  }
};

export const refreshService = async (refreshToken: string) => {
  const payload = jwtVerify(refreshToken, Env.JWT_REFRESH_SECRET);

  let user = await UserModel.findById(payload.id);

  if (!user) throw new ForbiddenException();

  const isValid = await compareVal(refreshToken, user.refreshToken!);

  if (!isValid) throw new UnauthorizedException();

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  const hashedRefreshToken: string = await hashToken(newRefreshToken);
  user = await UserModel.findOneAndUpdate(
    { _id: user._id },
    { $set: { refreshToken: hashedRefreshToken } },
    { new: true },
  ).populate(USER_POPULATE_CONFIG);

  const { chats, next } = await getUserChatService(user!._id.toString());

  return { user, newAccessToken, newRefreshToken, chats, next };
};

export const verifyService = async (verifyToken: string) => {
  const payload = jwtVerify(verifyToken, Env.JWT_VERIFY_SECRET);

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
  const systemId = getEnv("SYSTEM_USER_ID");

  const user = await UserModel.findOne({
    email: userEmail,
    _id: { $ne: systemId },
  });

  if (!user) throw new NotFoundException("User not found");

  if (user.isAI) throw new BadRequestException("Invalid user");

  if (user.isVerified)
    throw new NotAllowedException("User is already verified");

  const confirmToken: string = signConfirmToken(user);

  sendMail({
    from: Env.SENDER_EMAIL,
    to: user.email!,
    subject: `Verify You New Account ${user.name}`,
    text: `This token will expire in 15 minutes!: ${Env.API_URL}${Env.API_VERSION}auth/verify/${confirmToken}`,
  });
};

export const setPasswordService = async (
  body: SetPasswordSchemaType,
  userId: string,
) => {
  const { password } = body;
  let user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  if (user.provider !== "google")
    throw new NotAllowedException("User already has a password");

  const hashedPass: string = await hashPass(password);

  user = await UserModel.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        password: hashedPass,
        provider: "merged",
      },
    },
    { new: true },
  ).populate(USER_POPULATE_CONFIG);

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  return { user, newAccessToken, newRefreshToken };
};

export const sendForgotPasswordService = async (userEmail: EmailSchemaType) => {
  const systemId = getEnv("SYSTEM_USER_ID");

  const user = await UserModel.findOne({
    email: userEmail,
    _id: { $ne: systemId },
  });

  if (!user) throw new NotFoundException("User not found");

  if (user.isAI) throw new BadRequestException("Invalid user");

  if (!user.isVerified) throw new NotAllowedException("User is not verified");

  if (user.provider === "google")
    throw new NotAllowedException("Google account does not have a password");

  const forgotPasswordToken: string = signForgotPasswordToken(user);

  sendMail({
    from: Env.SENDER_EMAIL,
    to: user.email!,
    subject: `Update Your Password ${user.name}`,
    text: `This token will expire in 15 minutes!: ${Env.API_URL}${Env.API_VERSION}auth/forgot-password/${forgotPasswordToken}`,
  });
};

export const forgotPasswordService = async (forgotPasswordToken: string) => {
  const payload = jwtVerify(
    forgotPasswordToken,
    Env.JWT_FORGOT_PASSWORD_SECRET,
  );

  const user = await UserModel.findById(payload.id);

  if (!user) throw new NotFoundException("User not found");

  if (!user.isVerified) throw new NotAllowedException("User is not verified");

  await UserModel.updateOne(
    { _id: payload.id },
    {
      $set: {
        forgotPassword: true,
        refreshToken: "",
      },
    },
  );
};

export const updatePasswordService = async (
  body: UpdatePasswordSchema,
  forgotPasswordToken: string,
) => {
  const { newPassword } = body;

  const payload = jwtVerify(
    forgotPasswordToken,
    Env.JWT_FORGOT_PASSWORD_SECRET,
  );

  const user = await UserModel.findById(payload.id);

  if (!user) throw new NotFoundException("User not found");

  if (!user.forgotPassword)
    throw new BadRequestException("User password still valid");

  const sameAsOld: boolean = await user.comparePassword(newPassword!);
  if (sameAsOld) throw new BadRequestException("Password cannot be the same");

  const hashedPass: string = await hashPass(newPassword);

  await UserModel.updateOne(
    { _id: user._id },
    {
      $set: {
        password: hashedPass,
        forgotPassword: false,
      },
    },
  );
};

export const changePasswordService = async (
  body: ChangePasswordSchema,
  _id: string,
) => {
  const user = await UserModel.findOne({ _id });

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

export const enable2faService = async (user: Express.User): Promise<string> => {
  const secret = speakeasy.generateSecret({
    name: "Messenger Application",
  });

  await UserModel.updateOne(
    { _id: user._id },
    { $set: { secret2fa: secret.base32 } },
  );

  return new Promise((resolve, reject) => {
    qrcode.toDataURL(secret.otpauth_url!, (err, data) => {
      if (err) {
        return reject(
          new InternalServerException("Failed to generate QR Code"),
        );
      }
      resolve(data);
    });
  });
};

export const disable2faService = async (user: Express.User) => {
  if (!user.enabled2fa)
    throw new NotAllowedException("2FA not enabled on this user");

  await UserModel.updateOne(
    { _id: user._id },
    {
      $set: {
        enabled2fa: false,
        secret2fa: null,
      },
    },
  );
};

export const verify2faService = async (userId: string, token: string) => {
  let user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  if (!user.secret2fa)
    throw new NotAllowedException("2FA not enabled on this user");

  const verified = speakeasy.totp.verify({
    secret: user.secret2fa!,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified) throw new UnauthorizedException("Invalid token");

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const hashedRefreshToken: string = await hashToken(refreshToken);

  if (!user.enabled2fa)
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { enabled2fa: true } },
    );

  user = await UserModel.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        refreshToken: hashedRefreshToken,
      },
    },
    { new: true },
  ).populate(USER_POPULATE_CONFIG);

  return { user, accessToken, refreshToken };
};
