import cloudinary from "../config/cloudinary.config";
import UserModel from "../models/user.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { cloudinaryDelete, cloudinaryPost } from "../utils/cloudinary";
import { getPublicIdFromUrl } from "../utils/get-url";
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

  if (user.name === newName && user.avatar === avatar && avatar)
    throw new BadRequestException(
      "New name or avatar must be different from the old",
    );

  if (newName) user.name = newName;
  if (avatar && avatar !== user.avatar) {
    if (user.avatar) {
      const publicId = getPublicIdFromUrl(user.avatar);
      if (publicId) {
        await cloudinaryDelete(publicId);
      }
    }

    const uploadRes = await cloudinaryPost(avatar, "user_avatars");
    user.avatar = uploadRes.secure_url;
  }

  await user.save();

  return user;
};

export const deleteUserService = async (userId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  if (user.avatar) {
    const publicId = getPublicIdFromUrl(user.avatar);
    if (publicId) {
      await cloudinaryDelete(publicId);
    }
  }

  await UserModel.deleteOne({ _id: userId });
};
