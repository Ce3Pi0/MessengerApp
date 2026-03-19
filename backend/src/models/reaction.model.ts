import mongoose, { Document, Schema } from "mongoose";

export interface ReactionDocument extends Document {
  chatId: mongoose.Types.ObjectId;
  reactor: mongoose.Types.ObjectId;
  createdAt: Date;
  emoji: string;
}

const ReactionSchema = new Schema<ReactionDocument>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    reactor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String },
  },
  {
    timestamps: true,
  },
);

const ReactionModel = mongoose.model<ReactionDocument>(
  "Reaction",
  ReactionSchema,
);

export default ReactionModel;
