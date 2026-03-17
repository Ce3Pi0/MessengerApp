import mongoose, { Document, Schema } from "mongoose";

export interface MessageDocument extends Document {
  chatId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content?: string;
  image?: string;
  replyTo?: mongoose.Types.ObjectId;
  reactions?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<MessageDocument>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String },
    image: { type: String },
    replyTo: { type: Schema.Types.ObjectId, ref: "Message", default: null },
    reactions: [
      { type: Schema.Types.ObjectId, ref: "Reaction", default: null },
    ],
  },
  {
    timestamps: true,
  },
);

const MessageModel = mongoose.model<MessageDocument>("Message", MessageSchema);

export default MessageModel;
