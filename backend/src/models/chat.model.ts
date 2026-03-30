import mongoose, { Document, Schema } from "mongoose";

export interface ChatDocument extends Document {
  participants: mongoose.Types.ObjectId[];
  administrators: mongoose.Types.ObjectId[];
  avatar?: string | null;
  background?: string | null;
  lastMessage: mongoose.Types.ObjectId;
  lastReaction: mongoose.Types.ObjectId;
  isGroup: boolean;
  groupName: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<ChatDocument>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    administrators: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    avatar: { type: String, default: null },
    background: { type: String, default: null },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message", default: null },
    lastReaction: {
      type: Schema.Types.ObjectId,
      ref: "Reaction",
      default: null,
    },
    isGroup: { type: Boolean, default: false },
    groupName: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  },
);

const ChatModel = mongoose.model<ChatDocument>("Chat", chatSchema);

export default ChatModel;
