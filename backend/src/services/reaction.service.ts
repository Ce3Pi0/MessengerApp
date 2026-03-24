import "../models/reaction.model";
import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";
import { BadRequestException } from "../utils/app-error";
import { isParticipant } from "../utils/isParticipant";
import {
  DeleteReactionSchemaType,
  SendReactionSchemaType,
} from "../validators/reaction.validators";
import ReactionModel from "../models/reaction.model";
import {
  emitDeletedReactionToChatRoom,
  emitLastUpdateToParticipant,
  emitUpdatedReactionToChatRoom,
} from "../lib/socket";
import { findExistingReaction } from "../utils/findExistingReaction";

export const sendReactionService = async (
  userId: string,
  body: SendReactionSchemaType,
) => {
  const { chatId, messageId, emoji } = body;

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new BadRequestException("Chat not found");

  if (
    !isParticipant(
      userId.toString(),
      chat.participants.map((id) => id.toString()),
    )
  )
    throw new BadRequestException("User is not participant of the chat");

  const msg = await MessageModel.findById(messageId).populate("reactions");

  if (!msg) throw new BadRequestException("Message not found");

  if (msg.chatId.toString() !== chat._id.toString())
    throw new BadRequestException("Message/Chat mismatch");

  let reaction = findExistingReaction(msg, userId.toString());

  if (reaction) {
    await ReactionModel.updateOne({ _id: reaction._id }, { emoji });
  } else {
    reaction = await ReactionModel.create({
      chatId,
      reactor: userId,
      emoji,
    });

    await MessageModel.updateOne(
      { _id: messageId },
      { $push: { reactions: reaction._id } },
    );
  }

  const updatedMsg = (await MessageModel.findById(messageId).populate({
    path: "reactions",
    populate: {
      path: "reactor",
      select: "name avatar",
    },
  })) as any;

  if (!updatedMsg) throw new BadRequestException("No message was updated");

  const targetReaction = updatedMsg.reactions!.find(
    (r: any) => r._id.toString() === reaction._id.toString(),
  );

  if (!targetReaction || !targetReaction.reactor) {
    throw new BadRequestException("Reactor data not found");
  }

  const reactor = targetReaction.reactor;

  const updatedChat = await ChatModel.updateOne(
    {
      _id: chat._id,
    },
    {
      $set: {
        lastReaction: reaction._id,
        lastMessage: null,
      },
    },
  );

  emitUpdatedReactionToChatRoom(
    reaction._id.toString(),
    reactor,
    chatId,
    updatedMsg?.id,
    emoji,
  );

  const updatedReaction = {
    reactor: {
      _id: reactor._id,
      name: reactor.name,
    },
    emoji,
    createdAt: reaction.createdAt,
  };

  const allParticipantIds = chat.participants.map((id) => id.toString());
  emitLastUpdateToParticipant(allParticipantIds, chatId, updatedReaction);

  return { updatedMsg, updatedChat };
};

export const deleteReactionService = async (
  userId: string,
  body: DeleteReactionSchemaType,
) => {
  const { chatId, messageId } = body;

  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new BadRequestException("Chat not found");

  if (
    !isParticipant(
      userId.toString(),
      chat.participants.map((id) => id.toString()),
    )
  )
    throw new BadRequestException("User is not participant of the chat");

  const msg = await MessageModel.findById(messageId).populate("reactions");

  if (!msg) throw new BadRequestException("Message not found");

  if (msg.chatId.toString() !== chat._id.toString())
    throw new BadRequestException("Message/Chat mismatch");

  const existingReaction = findExistingReaction(msg, userId.toString());

  if (!existingReaction)
    throw new BadRequestException("User hasn't reacted to this message");

  const reactionId = existingReaction._id;

  await ReactionModel.findByIdAndDelete(reactionId);
  await MessageModel.updateOne(
    { _id: messageId },
    { $pull: { reactions: reactionId } },
  );

  const updatedMsg = await MessageModel.findById(messageId).populate({
    path: "reactions",
    populate: {
      path: "reactor",
      select: "name avatar",
    },
  });

  emitDeletedReactionToChatRoom(userId, chatId, updatedMsg?.id, reactionId);

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

  return { updatedMsg };
};
