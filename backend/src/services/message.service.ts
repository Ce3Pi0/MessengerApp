import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config";
import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { SendMessageSchemaType } from "../validators/message.validator";
import {
  emitLastMessageToParticipant,
  emitNewMessageToChatRoom,
} from "../lib/socket";

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
    const uploadRes = await cloudinary.uploader.upload(image);
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

  await ChatModel.updateOne(
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

  return { newMessage, chat };
};
