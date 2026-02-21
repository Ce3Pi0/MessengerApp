import mongoose, { Document, Schema } from "mongoose";

export interface ChatDocument extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
  isGroup: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<ChatDocument>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message", default: null },
    isGroup: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  },
);

const chatModel = mongoose.model<ChatDocument>("Chat", chatSchema);

export default chatModel;
