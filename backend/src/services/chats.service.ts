// TODO: Fetch reactions (populate return values)

import {
  emitChatDeletedToParticipants,
  emitChatToNewParticipant,
  emitChatUpdateToParticipants,
  emitNewChatToParticipants,
  emitUserAddedToParticipants,
  emitUserRemovedToParticipants,
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
import { cloudinaryDelete, cloudinaryPost } from "../utils/cloudinary";
import { UpdateChatSchemaType } from "../validators/chat.validator";

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
      administrators: [userId],
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

export const updateChatService = async (
  userId: string,
  body: UpdateChatSchemaType,
) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const { chatId, groupName, avatar } = body;

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new NotFoundException("Chat not found");

  if (!chat.isGroup) throw new BadRequestException("Chat is not a group");

  const isUserAdmin = chat.participants.includes(new Types.ObjectId(userId));

  if (!isUserAdmin) throw new NotAllowedException("User is not a group admin");

  if (groupName && !chat.isGroup)
    throw new BadRequestException("Chat is not a group");

  if (groupName === chat.groupName && !avatar)
    throw new BadRequestException(`Group name is already ${groupName}`);

  if (groupName) chat.groupName = groupName;
  if (avatar) {
    avatar && chat.avatar !== avatar;
    if (chat.avatar) {
      const publicId = getPublicIdFromUrl(chat.avatar);
      if (publicId) {
        await cloudinaryDelete(publicId);
      }
    }
    const uploadRes = await cloudinaryPost(avatar, "chat_avatars");
    user.avatar = uploadRes.secure_url;
  }

  await chat.save();

  const allParticipantIds = chat!.participants.map((id) => id.toString());
  emitChatUpdateToParticipants(userId, allParticipantIds, chat);
};
//TODO: Implement logic
export const addAdminChatService = async (
  userId: string,
  chatId: string,
  userToBePromotedId: string,
) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new NotFoundException("Chat not found");

  if (!chat.isGroup) throw new BadRequestException("Chat is not a group");

  if (!chat.administrators.includes(user._id))
    throw new NotAllowedException("User is not an administrator");

  if (userId === userToBePromotedId)
    throw new BadRequestException("Cannot promote yourself");

  const userToBePromoted = await UserModel.findById(userToBePromotedId);

  if (!userToBePromoted)
    throw new NotFoundException("User to be promoted not found");

  if (!chat.participants.includes(userToBePromoted._id))
    throw new BadRequestException(
      "User to be promoted is not a member of this group",
    );

  if (!chat.administrators.includes(userToBePromoted._id))
    throw new BadRequestException(
      "User to be promoted is already an administrator",
    );

  chat.administrators.push(userToBePromoted._id);

  await chat.save();

  //TODO: ws emit to all participants

  return chat;
};

export const deleteChatService = async (userId: string, chatId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new NotFoundException("Chat not found");

  const isUserAdmin = chat.administrators.includes(new Types.ObjectId(userId));

  if (!isUserAdmin) throw new NotAllowedException("User is not a group admin");

  await ReactionModel.deleteMany({
    chatId,
  });

  //FIXME: remove favorite chat from any participant that has it set as favorite
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
) => {
  const currentUser = await UserModel.findById(userId);

  if (!currentUser) throw new NotFoundException("User not found");

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new NotFoundException("Chat not found");

  if (!chat.isGroup) throw new BadRequestException("Chat is not a group");

  const isUserAdmin = chat.administrators.includes(new Types.ObjectId(userId));

  if (!isUserAdmin) throw new NotAllowedException("User is not a group admin");

  const userToDelete = await UserModel.findById(userToRemoveId);

  if (!userToDelete) throw new NotFoundException("User to delete not found");

  const userToDeleteIsMember = chat.participants.includes(
    new Types.ObjectId(userToRemoveId),
  );

  if (!userToDeleteIsMember)
    throw new BadRequestException(
      "User to remove is not a member of this chat",
    );

  const allParticipantIds = chat!.participants.map((id) => id.toString());
  const chatName = chat.groupName;

  await ChatModel.findOneAndUpdate(
    {
      _id: chatId,
    },
    {
      $pull: { participants: new Types.ObjectId(userToRemoveId) },
    },
  );

  emitUserRemovedToParticipants(
    userId,
    allParticipantIds,
    chatName,
    chatId,
    userToRemoveId,
  );
};

export const addUserChatService = async (
  userId: string,
  chatId: string,
  participantId: string,
) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new NotFoundException("Chat not found");

  if (!chat.isGroup) throw new BadRequestException("Chat is not a group");

  const isUserAdmin = chat.administrators.includes(new Types.ObjectId(userId));

  if (!isUserAdmin) throw new NotAllowedException("User is not a group admin");

  const participant = await UserModel.findById(participantId);

  if (!participant) throw new NotFoundException("Participant not found");

  if (chat.participants.includes(new Types.ObjectId(participantId)))
    throw new BadRequestException("Participant is already in this group");

  const allParticipantIds = chat!.participants.map((id) => id.toString());

  const updatedChat = await ChatModel.findOneAndUpdate(
    {
      _id: chatId,
    },
    {
      $push: {
        participants: new Types.ObjectId(participantId),
      },
    },
    { new: true },
  ).populate("participants", "name avatar");

  emitChatToNewParticipant(participantId, updatedChat);
  emitUserAddedToParticipants(userId, allParticipantIds, chatId, participant);

  return updatedChat;
};
