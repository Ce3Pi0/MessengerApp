import type { UserType } from "./auth.type";

export type ChatType = {
  _id: string;
  avatar?: string;
  lastMessage: MessageType | null;
  lastReaction: ReactionDataType | null;
  participants: UserType[];
  isGroup: boolean;
  createdBy: string;
  groupName?: string;
  administrators?: UserType[];
  createdAt: string;
  updatedAt: string;
};

export type ReactionDataType = {
  _id: string;
  reactor: UserType;
  emoji: string;
  createdAt?: string;
};

export type MessageType = {
  _id: string;
  content: string | null;
  image: string | null;
  sender: UserType | null;
  replyTo: MessageType | null;
  reactions?: ReactionDataType[];
  chatId: string;
  createdAt: string;
  updatedAt: string;
  //Only to Frontend
  status?: string;
};

export type CreateChatType = {
  participantId?: string;
  isGroup?: boolean;
  participants?: string[];
  groupName?: string;
};

export type CreateMessageType = {
  chatId: string | null;
  content?: string;
  image?: string;
  replyTo?: MessageType | null;
};
