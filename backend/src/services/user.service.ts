import cloudinary from "../config/cloudinary.config";
import UserModel from "../models/user.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { UpdateUserSchemaType } from "../validators/user.validator";

export const findByIdUserService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new BadRequestException("User not found");
  return user;
};

export const getUsersService = async (
  userId: string,
  cursor: string | undefined,
  limit: number = 10,
) => {
  const query: any = { _id: { $ne: userId } };

  if (cursor) {
    query._id = { ...query._id, $gt: cursor };
  }

  const users = await UserModel.find(query)
    .select(
      "-password -refreshToken -forgotPassword -provider -isVerified -enabled2fa -secret2fa",
    )
    .sort({ _id: 1 })
    .limit(limit);

  const nextCursor =
    users.length === limit ? users[users.length - 1]._id : null;

  return {
    users,
    nextCursor,
  };
};

export const getSingleUserService = async (
  currentUserId: any,
  userId: string,
) => {
  const curUser = await UserModel.findById(currentUserId).select(
    "-password -refreshToken -forgotPassword -isVerified -secret2fa",
  );

  if (!curUser) throw new NotFoundException("User not found");

  if (currentUserId.toString() === userId) return curUser;

  const user = await UserModel.findById(userId).select(
    "-password -refreshToken -forgotPassword -provider -isVerified -enabled2fa -secret2fa",
  );

  return user;
};

export const updateUserService = async (
  userId: string,
  body: UpdateUserSchemaType,
) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const { name: newName, avatar } = body;

  if (user.name === newName)
    throw new BadRequestException("New name must be differ from the old name");
  if (user.avatar === avatar && avatar)
    throw new BadRequestException(
      "New avatar must be different from the old avatar",
    );

  if (newName) user.name = newName;
  if (avatar) {
    const uploadRes = await cloudinary.uploader.upload(avatar);
    user.avatar = uploadRes.secure_url;
  }

  await user.save();

  return user;
};
