// TODO: Implement sockets for real-time reaction transmission

import {
  DeleteReactionSchemaType,
  SendReactionSchemaType,
} from "../validators/reaction.validators";

export const sendReactionService = async (
  userId: string,
  body: SendReactionSchemaType,
) => {
  const { chatId, messageId, emoji } = body;

  //   Fetch chat

  //  Check chat

  // Check user participant of chat

  // Fetch message

  // Check if message in chat

  //   fetch Message reactions
  // If userId has reacted, update that reaction
  // Else create a new reaction and add the Id to the list in the message record

  // Emit changes via web sockets

  //return updated message and chat
};

export const deleteReactionService = async (
  userId: string,
  body: DeleteReactionSchemaType,
) => {
  const { reactionId, chatId, messageId } = body;

  //   Fetch chat

  //  Check chat

  // Check user participant of chat

  // Fetch message

  // Check if message in chat

  // Fetch message reactions

  // If user has reacted delete reaction reference in message and delete reaction by ID
  // Else throw error

  // Emit changes via web sockets

  //return updated message and chat
};
