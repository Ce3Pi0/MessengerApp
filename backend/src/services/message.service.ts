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
  emitReadMessageToParticipants,
  emitUpdatedMessageToChatRoom,
} from "../lib/socket";
import { cloudinaryDelete, cloudinaryPost } from "../utils/cloudinary";
import { getPublicIdFromUrl } from "../utils/get-url";
import ReactionModel from "../models/reaction.model";
import {
  MESSAGE_POPULATE_CONFIG,
  NEW_MESSAGE_POPULATE_CONFIG,
} from "../config/message-populate.config";
import { checkIfBlocked } from "../utils/is-user-blocked";
import UserModel from "../models/user.model";
import { getEnv } from "../utils/get-env";

export const sendSystemMessage = async (chatId: string, content: string) => {
  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new NotFoundException("Chat not found");

  const systemId = getEnv("SYSTEM_USER_ID");

  const newMessage = await MessageModel.create({
    chatId,
    sender: systemId,
    content,
    image: null,
    replyTo: null,
  });

  await newMessage.populate(MESSAGE_POPULATE_CONFIG);

  emitNewMessageToChatRoom(systemId, chatId, newMessage);
};

export const sendMessageService = async (
  userId: string,
  body: SendMessageSchemaType,
) => {
  const { chatId, content, image, replyToId } = body;

  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [user._id],
    },
  });

  if (!chat) throw new BadRequestException("Chat not found");

  await checkIfBlocked(chat, user);

  if (replyToId) {
    const replyMessage = await MessageModel.findOne({
      _id: replyToId,
      chatId,
    });
    if (!replyMessage) throw new NotFoundException("Reply message not found");
    if (replyMessage.sender.toString() === getEnv("SYSTEM_USER_ID"))
      throw new BadRequestException(
        "System user messages cannot be replied to",
      );
  }

  let imageUrl;
  if (image) {
    const uploadRes = await cloudinaryPost(image, "messages");
    imageUrl = uploadRes.secure_url;
  }

  const newMessage = await MessageModel.create({
    chatId,
    sender: user._id,
    content,
    image: imageUrl,
    replyTo: replyToId || null,
  });

  await newMessage.populate(NEW_MESSAGE_POPULATE_CONFIG);

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

  emitNewMessageToChatRoom(user._id.toString(), chatId, newMessage);

  const allParticipantIds = chat.participants.map((id) => id.toString());
  emitLastUpdateToParticipant(allParticipantIds, chatId, null, newMessage);

  return { newMessage, chat: updatedChat };
};

export const editMessageService = async (
  userId: string,
  body: EditMessageSchemaType,
) => {
  const { messageId, chatId, content } = body;

  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [user._id],
    },
  });

  if (!chat) throw new BadRequestException("Chat not found");

  await checkIfBlocked(chat, user);

  const oldMessage = await MessageModel.findOne({
    _id: messageId,
    chatId,
    sender: user._id,
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
  ).populate(MESSAGE_POPULATE_CONFIG);

  emitUpdatedMessageToChatRoom(user._id.toString(), chatId, newMessage);

  return { newMessage, chat };
};

export const readMessageService = async (
  userId: string,
  chatId: string,
  messageId: string,
) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [user._id],
    },
  });

  if (!chat) throw new BadRequestException("Chat not found");

  await checkIfBlocked(chat, user);

  const message = await MessageModel.findOne({
    _id: messageId,
    chatId,
  });

  if (!message) throw new NotFoundException("Message not found");

  if (message.sender.toString() === getEnv("SYSTEM_USER_ID"))
    throw new BadRequestException("System user messages cannot be read");

  if (message.sender.toString() === userId)
    throw new BadRequestException("You cannot mark your own message as read");

  if (message.readBy.includes(user._id))
    throw new BadRequestException("Message already read");

  await MessageModel.updateOne(
    {
      _id: messageId,
    },
    { $addToSet: { readBy: userId } },
  );

  const allParticipantIds = chat.participants.map((p: any) =>
    p._id ? p._id.toString() : p.toString(),
  );

  emitReadMessageToParticipants(user, allParticipantIds, messageId);
};

export const deleteMessageService = async (
  userId: string,
  body: DeleteMessageSchemaType,
) => {
  const { chatId, messageId } = body;

  const user = await UserModel.findById(userId);

  if (!user) throw new NotFoundException("User not found");

  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [user._id],
    },
  });

  if (!chat) throw new BadRequestException("Chat not found");

  await checkIfBlocked(chat, user);

  const message = await MessageModel.findOne({
    _id: messageId,
    chatId,
    sender: user._id,
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

  emitDeletedMessageToChatRoom(user._id.toString(), chatId, messageId);

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
