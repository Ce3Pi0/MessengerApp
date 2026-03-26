import { Types } from "mongoose";
import cloudinary from "../config/cloudinary.config";
import {
  emitBlockedToUser,
  emitChatUpdateToParticipants,
  emitUnblockedToUser,
} from "../lib/socket";
import ChatModel from "../models/chat.model";
import UserModel from "../models/user.model";
import {
  BadRequestException,
  NotAllowedException,
  NotFoundException,
} from "../utils/app-error";
import { cloudinaryDelete, cloudinaryPost } from "../utils/cloudinary";
import { getPublicIdFromUrl } from "../utils/get-url";
import { UpdateUserSchemaType } from "../validators/user.validator";
import {
  CHAT_POPULATE_CONFIG,
  SINGLE_CHAT_POPULATE_CONFIG,
} from "../config/chat-populate.config";
import { USER_POPULATE_CONFIG } from "../config/user-populate.config";

export const findByIdUserService = async (userId: string) => {
  const user = await UserModel.findById(userId).populate(USER_POPULATE_CONFIG);
  if (!user) throw new BadRequestException("User not found");
  return user;
};

export const getUsersService = async (
  userId: string,
  cursor: string | undefined,
  limit: number = 10,
) => {
  const query: any = {};

  if (cursor) {
    query._id = { $gt: cursor, $ne: userId };
  } else {
    query._id = { $ne: userId };
  }

  query.blocked = { $ne: userId };

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
  const curUser = await UserModel.findById(currentUserId)
    .select("-password -refreshToken -forgotPassword -isVerified -secret2fa")
    .populate(USER_POPULATE_CONFIG);

  if (!curUser) throw new NotFoundException("User not found");

  if (currentUserId.toString() === userId) return curUser;

  const user = await UserModel.findById(userId)
    .select(
      "-password -refreshToken -forgotPassword -provider -isVerified -enabled2fa -secret2fa",
    )
    .populate(USER_POPULATE_CONFIG);

  if (!user) throw new NotFoundException("User not found");

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

  const chats = await ChatModel.find({ participants: userId }).populate(
    CHAT_POPULATE_CONFIG,
  );

  for (let chat of chats) {
    const allParticipantIds = chat!.participants.map((p) => p._id.toString());
    emitChatUpdateToParticipants(userId, allParticipantIds, chat);
  }

  await user.populate(USER_POPULATE_CONFIG);

  return user;
};

export const addFavoriteUserService = async (
  userId: string,
  chatId: string,
  MAX_FAVORITE_CHATS: number = 20,
) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new NotFoundException("Chat not found");

  if (!chat.participants.includes(new Types.ObjectId(userId)))
    throw new NotAllowedException("User is not a member of this chat");

  if (user.favorites.includes(new Types.ObjectId(chatId)))
    throw new BadRequestException("Chat is already favorited");

  if (user.favorites.length >= MAX_FAVORITE_CHATS)
    throw new BadRequestException(
      `Cannot have more than ${MAX_FAVORITE_CHATS} favorite chats`,
    );

  user.favorites.push(new Types.ObjectId(chatId));

  await user.save();

  const updatedUser = await user.populate({
    path: "favorites",
    populate: USER_POPULATE_CONFIG,
    options: { sort: { updatedAt: -1 } },
  });

  return updatedUser;
};

export const removeFavoriteUserService = async (
  userId: string,
  chatId: string,
) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new NotFoundException("Chat not found");

  if (!chat.participants.includes(new Types.ObjectId(userId)))
    throw new NotAllowedException("User is not a member of this chat");

  if (!user.favorites.includes(new Types.ObjectId(chatId)))
    throw new BadRequestException("Chat is not favorited");

  user.favorites = user.favorites.filter((c) => c._id.toString() !== chatId);

  await user.save();

  const updatedUser = await user.populate({
    path: "favorites",
    populate: USER_POPULATE_CONFIG,
    options: { sort: { updatedAt: -1 } },
  });

  return updatedUser;
};

export const blockUserService = async (
  userId: string,
  userToBeBlockedId: string,
) => {
  console.log(userId, userToBeBlockedId);

  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  if (userId === userToBeBlockedId)
    throw new NotAllowedException("Cannot block yourself");

  const userToBeBlocked = await UserModel.findById(userToBeBlockedId);

  if (!userToBeBlocked)
    throw new NotAllowedException("User to be blocked not found");

  if (user.blocked.includes(userToBeBlocked._id))
    throw new BadRequestException("User already blocked");

  user.blocked.push(userToBeBlocked._id);

  await user.save();

  await user.populate(USER_POPULATE_CONFIG);

  emitBlockedToUser(userId, userToBeBlockedId);
};
export const unblockUserService = async (
  userId: string,
  userToBeUnblockedId: string,
) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const userToBeUnblocked = await UserModel.findById(userToBeUnblockedId);

  if (!userToBeUnblocked)
    throw new NotAllowedException("User to be unblocked not found");

  if (!user.blocked.includes(userToBeUnblocked._id))
    throw new BadRequestException("User isn't blocked");

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { $pull: { blocked: userToBeUnblockedId } },
    { new: true },
  ).populate(USER_POPULATE_CONFIG);

  if (!updatedUser) throw new BadRequestException("Something went wrong");

  emitUnblockedToUser(user, userToBeUnblockedId);

  const chat = await ChatModel.findOne({
    participants: { $all: [userId] },
  }).populate(CHAT_POPULATE_CONFIG);

  return chat;
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
  //TODO: ws cast to all participants
};
