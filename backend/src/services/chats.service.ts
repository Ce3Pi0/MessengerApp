import { emitNewChatToParticipants } from "../lib/socket";
import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";
import UserModel from "../models/user.model";
import {
  BadRequestException,
  NotAllowedException,
  NotFoundException,
} from "../utils/app-error";
import { checkParticipants } from "../utils/checkParticipants";

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
    }).populate("participants", "name avatar");

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
    query.updatedAt = { $gt: cursor };
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
  });

  if (!chat) throw new BadRequestException("Chat not found");

  const query: any = { chatId };

  if (cursor) {
    query.updatedAt = { $gt: cursor };
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
    .sort({ createdAt: -1 })
    .limit(10);

  const next =
    messages.length === limit ? messages[messages.length - 1].createdAt : null;

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
