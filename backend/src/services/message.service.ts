import cloudinary from "../config/cloudinary.config";
import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import {
  SendMessageSchemaType,
  EditMessageSchemaType,
  DeleteMessageSchemaType,
} from "../validators/message.validator";
import {
  emitDeletedMessageToChatRoom,
  emitLastUpdateToParticipant,
  emitNewMessageToChatRoom,
  emitUpdatedMessageToChatRoom,
} from "../lib/socket";
import { cloudinaryDelete, cloudinaryPost } from "../utils/cloudinary";
import { getPublicIdFromUrl } from "../utils/get-url";
import ReactionModel from "../models/reaction.model";

export const sendMessageService = async (
  userId: string,
  body: SendMessageSchemaType,
) => {
  const { chatId, content, image, replyToId } = body;

  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  });

  if (!chat) throw new BadRequestException("Chat not found");

  if (replyToId) {
    const replyMessage = await MessageModel.findOne({
      _id: replyToId,
      chatId,
    });
    if (!replyMessage) throw new NotFoundException("Reply message not found");
  }

  let imageUrl;
  if (image) {
    const uploadRes = await cloudinaryPost(image, "messages");
    imageUrl = uploadRes.secure_url;
  }

  const newMessage = await MessageModel.create({
    chatId,
    sender: userId,
    content,
    image: imageUrl,
    replyTo: replyToId || null,
  });

  await newMessage.populate([
    {
      path: "sender",
      select: "name avatar",
    },
    {
      path: "replyTo",
      select: "content image sender",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    },
  ]);

  const updatedChat = await ChatModel.updateOne(
    {
      _id: chat._id,
    },
    {
      $set: {
        lastMessage: newMessage._id,
        lastReaction: null,
      },
    },
  );

  emitNewMessageToChatRoom(userId, chatId, newMessage);

  const allParticipantIds = chat.participants.map((id) => id.toString());
  emitLastUpdateToParticipant(allParticipantIds, chatId, null, newMessage);

  return { newMessage, chat: updatedChat };
};

export const editMessageService = async (
  userId: string,
  body: EditMessageSchemaType,
) => {
  const { messageId, chatId, content } = body;

  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  });

  if (!chat) throw new BadRequestException("Chat not found");

  const oldMessage = await MessageModel.findOne({
    _id: messageId,
    chatId,
    sender: userId,
  });

  if (!oldMessage) throw new NotFoundException("Message not found");

  if (oldMessage.image)
    throw new BadRequestException("Images cannot be edited");

  const newMessage = await MessageModel.findByIdAndUpdate(
    messageId,
    {
      content,
    },
    { new: true },
  ).populate({
    path: "reactions",
    populate: {
      path: "reactor",
      select: "name avatar",
    },
  });

  await newMessage!.populate([
    {
      path: "sender",
      select: "name avatar",
    },
    {
      path: "replyTo",
      select: "contents image sender",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    },
  ]);

  emitUpdatedMessageToChatRoom(userId, chatId, newMessage);

  return { newMessage, chat };
};

export const deleteMessageService = async (
  userId: string,
  body: DeleteMessageSchemaType,
) => {
  const { chatId, messageId } = body;

  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  });

  if (!chat) throw new BadRequestException("Chat not found");

  const message = await MessageModel.findOne({
    _id: messageId,
    chatId,
    sender: userId,
  });

  if (!message) throw new NotFoundException("Message not found");

  if (message.image) {
    const publicId = getPublicIdFromUrl(message.image);
    if (publicId) {
      await cloudinaryDelete(publicId);
    }
  }

  await ReactionModel.deleteMany({
    _id: { $in: message.reactions },
  });

  await MessageModel.deleteOne({
    _id: messageId,
  });

  emitDeletedMessageToChatRoom(userId, chatId, messageId);

  const latestMessage = await MessageModel.findOne({ chatId })
    .sort({
      createdAt: -1,
    })
    .populate("sender", "name");
  const latestReaction = await ReactionModel.findOne({ chatId })
    .sort({
      createdAt: -1,
    })
    .populate("reactor", "name");

  const messageTime = latestMessage?.createdAt?.getTime() || 0;
  const reactionTime = latestReaction?.createdAt?.getTime() || 0;

  const allParticipantIds = chat.participants.map((id) => id.toString());

  if (messageTime > reactionTime) {
    await chat.updateOne({
      $set: {
        lastMessage: latestMessage,
      },
    });
    emitLastUpdateToParticipant(allParticipantIds, chatId, null, latestMessage);
  } else {
    await chat.updateOne({
      $set: {
        lastReaction: latestReaction,
      },
    });
    emitLastUpdateToParticipant(allParticipantIds, chatId, latestReaction);
  }

  return { chat };
};
