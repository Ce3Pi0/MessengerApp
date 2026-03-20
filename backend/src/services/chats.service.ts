// TODO: Fetch reactions (populate return values)

import {
  emitChatDeletedToParticipants,
  emitNewChatToParticipants,
} from "../lib/socket";
import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";
import ReactionModel from "../models/reaction.model";
import UserModel from "../models/user.model";
import {
  BadRequestException,
  NotAllowedException,
  NotFoundException,
} from "../utils/app-error";
import { checkParticipants } from "../utils/checkParticipants";
import { Types } from "mongoose";
import { getPublicIdFromUrl } from "../utils/get-url";
import { cloudinaryDelete } from "../utils/cloudinary";

export const createChatService = async (
  userId: string,
  body: {
    participantId?: string;
    isGroup?: boolean;
    participants?: string[];
    groupName?: string;
  },
) => {
  const { participantId, isGroup, participants, groupName } = body;

  let chat;
  let allParticipantsIds: string[] = [];

  if (isGroup && participants?.length && groupName) {
    await checkParticipants(participants);

    allParticipantsIds = [userId, ...participants];
    chat = await ChatModel.create({
      participants: allParticipantsIds,
      isGroup,
      groupName,
      createdBy: userId,
    });
  } else if (participantId) {
    const otherUser = await UserModel.findById(participantId);
    if (!otherUser) throw new NotFoundException("User not found");

    allParticipantsIds = [userId, participantId];

    const existingChat = await ChatModel.findOne({
      participants: {
        $all: allParticipantsIds,
        $size: 2,
      },
    })
      .populate("participants", "name avatar")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name avatar",
        },
      })
      .populate({
        path: "lastReaction",
        populate: {
          path: "reactor",
          select: "name",
        },
      });

    if (existingChat) return existingChat;

    chat = await ChatModel.create({
      participants: allParticipantsIds,
      createdBy: userId,
    });
  }
  const populatedChat = await chat?.populate("participants", "name avatar");

  emitNewChatToParticipants(allParticipantsIds, populatedChat);

  return chat;
};

export const getUserChatService = async (
  userId: string,
  cursor?: string,
  limit: number = 10,
) => {
  const query: any = { participants: { $in: [userId] } };

  if (cursor) {
    query.updatedAt = { $lt: cursor };
  }

  const chats = await ChatModel.find(query)
    .populate("participants", "name avatar")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    })
    .populate({
      path: "lastReaction",
      populate: {
        path: "reactor",
        select: "name",
      },
    })

    .sort({ updatedAt: -1 })
    .limit(limit);

  const next =
    chats.length === limit ? chats[chats.length - 1].updatedAt : null;

  return { chats, next };
};

export const getSingleChatService = async (
  chatId: string,
  userId: string,
  cursor?: string,
  limit: number = 10,
) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  }).populate("participants", "name avatar");

  if (!chat) throw new BadRequestException("Chat not found");

  const query: any = { chatId };

  if (cursor) {
    query.updatedAt = { $lt: cursor };
  }

  const messages = await MessageModel.find(query)
    .populate("sender", "name avatar")
    .populate({
      path: "replyTo",
      select: "content image sender",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    })
    .populate({
      path: "reactions",
      populate: {
        path: "reactor",
        select: "name avatar",
      },
    })
    .sort({ createdAt: -1 })
    .limit(limit);

  const next =
    messages.length === limit ? messages[messages.length - 1].createdAt : null;

  messages.reverse();

  return {
    chat,
    messages,
    next,
  };
};

export const validateChatParticipant = async (
  chatId: string,
  userId: string,
) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  });
  if (!chat) throw new BadRequestException("Chat not found");

  return chat;
};

export const deleteChatService = async (userId: string, chatId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new NotFoundException("Chat not found");

  const isUserAdmin = chat.participants.includes(new Types.ObjectId(userId));

  if (!isUserAdmin) throw new NotAllowedException("User is not a group admin");

  await ReactionModel.deleteMany({
    chatId,
  });

  //TODO: remove favorite chat from any participant that has it set as favorite
  const imageList = await MessageModel.distinct("image", {
    image: { $ne: "" },
  });
  for (const image of imageList) {
    const publicId = getPublicIdFromUrl(image);
    if (publicId) {
      await cloudinaryDelete(publicId);
    }
  }

  await MessageModel.deleteMany({
    chatId,
  });
  await ChatModel.deleteOne({ _id: chatId });

  const allParticipantIds = chat.participants.map((id) => id.toString());
  emitChatDeletedToParticipants(allParticipantIds, chatId, userId);
};

export const removeUserFromChatService = async (
  userId: string,
  userToRemoveId: string,
  chatId: string,
) => {};
