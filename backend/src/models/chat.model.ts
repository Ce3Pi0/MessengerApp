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
  isAiChat: boolean;
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
    isAiChat: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  },
);

chatSchema.pre("save", async function (next) {
  if (this.isNew) {
    const User = mongoose.model("User");
    const participants = await User.find({
      _id: { $in: this.participants },
      isAI: true,
    });
    if (participants.length > 0) {
      this.isAiChat = true;
    }
  }
  next();
});

const ChatModel = mongoose.model<ChatDocument>("Chat", chatSchema);

export default ChatModel;
