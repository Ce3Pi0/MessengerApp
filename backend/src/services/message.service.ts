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
  emitLastMessageToParticipant,
  emitNewMessageToChatRoom,
  emitUpdatedMessageToChatRoom,
} from "../lib/socket";
import { cloudinaryDelete, cloudinaryPost } from "../utils/cloudinary";
import { getPublicIdFromUrl } from "../utils/get-url";

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
      select: "contents image sender",
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
      },
    },
  );

  emitNewMessageToChatRoom(userId, chatId, newMessage);

  const allParticipantIds = chat.participants.map((id) => id.toString());
  emitLastMessageToParticipant(allParticipantIds, chatId, newMessage);

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
  );

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

  await MessageModel.deleteOne({
    _id: messageId,
  });

  emitDeletedMessageToChatRoom(userId, chatId, messageId);

  return { chat };
};
