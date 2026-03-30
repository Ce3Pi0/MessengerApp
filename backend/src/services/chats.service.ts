import {
  emitChatDeletedToParticipants,
  emitChatToNewParticipant,
  emitChatUpdateToParticipants,
  emitNewChatToParticipants,
  emitReadMessagesToParticipants,
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
import {
  CHAT_POPULATE_CONFIG,
  SINGLE_CHAT_POPULATE_CONFIG,
} from "../config/chat-populate.config";
import { MESSAGE_POPULATE_CONFIG } from "../config/message-populate.config";
import { sendSystemMessage } from "./message.service";
import { getEnv } from "../utils/get-env";

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

    if (otherUser && otherUser.blocked.includes(new Types.ObjectId(userId)))
      throw new BadRequestException("The user has blocked you");

    allParticipantsIds = [userId, participantId];

    const existingChat = await ChatModel.findOne({
      participants: {
        $all: allParticipantsIds,
        $size: 2,
      },
    }).populate(CHAT_POPULATE_CONFIG);

    if (existingChat) return existingChat;

    chat = await ChatModel.create({
      participants: allParticipantsIds,
      createdBy: userId,
    });
  }
  const populatedChat = await chat?.populate(CHAT_POPULATE_CONFIG);

  emitNewChatToParticipants(allParticipantsIds, populatedChat);

  return chat;
};

export const getUserChatService = async (
  userId: string,
  cursor?: string,
  limit: number = 10,
) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const query: any = { participants: { $in: [userId] } };

  if (cursor) {
    query.updatedAt = { $lt: cursor };
  }

  query.$or = [
    { isGroup: true },
    {
      isGroup: false,
      participants: { $nin: user.blocked },
    },
  ];

  const chats = await ChatModel.find(query)
    .populate(CHAT_POPULATE_CONFIG)
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
  const systemUserId = getEnv("SYSTEM_USER_ID");
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  }).populate(SINGLE_CHAT_POPULATE_CONFIG);

  if (!chat) throw new BadRequestException("Chat not found");

  const query: any = { chatId };

  if (cursor) {
    query.updatedAt = { $lt: cursor };
  }

  const messages = await MessageModel.find(query)
    .populate(MESSAGE_POPULATE_CONFIG)
    .sort({ createdAt: -1 })
    .limit(limit);

  query.readBy = { $nin: [userId] };

  const unseenMessage = await MessageModel.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);

  let seenMessages: string[] = [];

  for (const message of unseenMessage) {
    const senderId =
      typeof message.sender === "string"
        ? message.sender
        : message.sender?._id?.toString?.() || message.sender?.toString?.();

    if (senderId !== userId) {
      await MessageModel.updateOne(
        { _id: message._id },
        { $addToSet: { readBy: new Types.ObjectId(userId) } },
      );
      seenMessages.push(message._id.toString());
    }
  }

  if (seenMessages.length > 0) {
    const allParticipantIds = chat.participants.map((p: any) =>
      p._id ? p._id.toString() : p.toString(),
    );
    emitReadMessagesToParticipants(user, allParticipantIds, seenMessages);
  }

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

// TODO: Refactor
export const updateChatService = async (
  userId: string,
  chatId: string,
  body: UpdateChatSchemaType,
) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const { groupName, avatar, background } = body;

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new NotFoundException("Chat not found");

  if (!chat.isGroup) throw new BadRequestException("Chat is not a group");

  const isUserAdmin = chat.participants.includes(new Types.ObjectId(userId));

  if (!isUserAdmin) throw new NotAllowedException("User is not a group admin");

  if ((groupName || avatar || background) && !chat.isGroup)
    throw new BadRequestException("Chat is not a group");

  if (groupName === chat.groupName && !avatar && !background)
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
    chat.avatar = uploadRes.secure_url;
  }
  if (background) {
    background && chat.background !== background;
    if (chat.background) {
      const publicId = getPublicIdFromUrl(chat.background);
      if (publicId) {
        await cloudinaryDelete(publicId);
      }
    }
    if (background !== "RESET") {
      const uploadRes = await cloudinaryPost(background, "chat_backgrounds");
      chat.background = uploadRes.secure_url;
    } else chat.background = null;
  }

  await chat.save();

  await chat.populate(SINGLE_CHAT_POPULATE_CONFIG);

  const allParticipantIds = chat.participants.map((p: any) =>
    p._id ? p._id.toString() : p.toString(),
  );

  await sendSystemMessage(
    chatId,
    `${user.name} changed the group ${groupName ? "name" : avatar ? "avatar" : "background"}`,
  );
  emitChatUpdateToParticipants(userId, allParticipantIds, chat);

  return chat;
};
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

  if (chat.administrators.includes(userToBePromoted._id))
    throw new BadRequestException(
      "User to be promoted is already an administrator",
    );

  chat.administrators.push(userToBePromoted._id);

  await chat.save();
  await chat.populate(SINGLE_CHAT_POPULATE_CONFIG);

  const allParticipantIds = chat.participants.map((p: any) =>
    p._id ? p._id.toString() : p.toString(),
  );

  await sendSystemMessage(
    chatId,
    `${user.name} promoted ${userToBePromoted.name} to administrator`,
  );
  emitChatUpdateToParticipants(userId, allParticipantIds, chat);

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

  await UserModel.updateMany(
    { favorites: chatId },
    {
      $pull: {
        favorites: chatId,
      },
    },
  );

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

  if (!chat.isGroup) {
    const otherUserId = chat.participants.filter((p) => p._id === user._id)[0];

    const otherUser = await UserModel.findById(otherUserId);

    if (otherUser && otherUser.blocked.includes(user._id)) return;
  }
  const allParticipantIds = chat.participants.map((id) => id.toString());

  emitChatDeletedToParticipants(allParticipantIds, chatId, userId.toString());
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
      $pull: { participants: userToRemoveId, administrators: userToRemoveId },
    },
  );

  await sendSystemMessage(
    chatId,
    `${currentUser.name} removed ${userToDelete.name} from the group chat`,
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
        participants: participantId,
      },
    },
    { new: true },
  ).populate(SINGLE_CHAT_POPULATE_CONFIG);

  await sendSystemMessage(
    chatId,
    `${user.name} added ${participant.name} to the group chat`,
  );
  emitChatToNewParticipant(participantId, updatedChat);
  emitUserAddedToParticipants(userId, allParticipantIds, chatId, participant);

  return updatedChat;
};
