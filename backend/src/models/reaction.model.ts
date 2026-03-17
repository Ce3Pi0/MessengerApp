import mongoose, { Document, Schema } from "mongoose";

export interface ReactionDocument extends Document {
  reactor: mongoose.Types.ObjectId;
  emoji: string;
}

const ReactionSchema = new Schema<ReactionDocument>(
  {
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
