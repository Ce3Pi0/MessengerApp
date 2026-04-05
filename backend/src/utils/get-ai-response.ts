import { ModelMessage, streamText } from "ai";
import {
  AI_CONTENT_POPULATE_CONFIG,
  AI_MESSAGE_POPULATE_CONFIG,
} from "../config/message-populate.config";
import MessageModel from "../models/message.model";
import UserModel from "../models/user.model";
import { NotFoundException } from "./app-error";
import { google } from "@ai-sdk/google";
import { emitChatAI, emitLastUpdateToParticipant } from "../lib/socket";

export const getAIResponse = async (chatId: string, userId: string) => {
  const messengerAI = await UserModel.findOne({ isAI: true });
  if (!messengerAI) {
    throw new NotFoundException("Messenger AI user not found");
  }

  const chatHistory = await getChatHistoryForAI(chatId);

  const formattedMessages: ModelMessage[] = chatHistory.map((message: any) => {
    const role = message.sender.isAI ? "assistant" : "user";
    const parts: any[] = [];

    if (message.image) {
      parts.push({
        type: "file",
        data: message.image,
        mediaType: "image/png",
        filename: "image.png",
      });
      if (!message.content) {
        parts.push({
          type: "text",
          text: "Describe what you see in the image",
        });
      }
    }

    if (message.content) {
      parts.push({
        type: "text",
        text: message.replyTo
          ? `[Replying to: "${message.replyTo.content}"]\n${message.content}`
          : message.content,
      });
    }

    return { role, content: parts };
  });

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: formattedMessages,
    system:
      "You are a Messenger AI, a helpful and friendly assistant. Respond only with text and attend to the last user message only.",
  });

  let fullResponse = "";
  for await (const chunk of result.textStream) {
    emitChatAI({
      chatId,
      chunk,
      done: false,
    });
    fullResponse += chunk;
  }

  if (!fullResponse.trim()) return "";

  const aiMessage = await MessageModel.create({
    chatId,
    sender: messengerAI._id,
    content: fullResponse,
  });

  await aiMessage.populate(AI_MESSAGE_POPULATE_CONFIG);

  // Emit full AI message
  emitChatAI({
    chatId,
    chunk: null,
    done: true,
  });

  emitLastUpdateToParticipant([userId], chatId, null, aiMessage);

  return aiMessage;
};

const getChatHistoryForAI = async (
  chatId: string,
  historyLimit: number = 5,
) => {
  const messages = await MessageModel.find({ chatId })
    .populate(AI_CONTENT_POPULATE_CONFIG)
    .sort({ createdAt: -1 })
    .limit(historyLimit)
    .lean();

  return messages.reverse(); // Reverse to get chronological order
};
