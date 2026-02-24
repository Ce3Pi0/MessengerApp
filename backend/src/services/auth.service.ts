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

export const googleAuthService = async () => {
  // Google authentication logic would go here
  return { message: "Google authentication successful" };
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
