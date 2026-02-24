import mongoose, { Document, Schema } from "mongoose";
import { compareVal, hashPass, hashToken } from "../utils/bcrypt";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  refreshToken?: string;
  provider: "local" | "google";
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(val: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    googleId: { type: String },
    refreshToken: { type: String },
    provider: { type: String, enum: ["local", "google"], required: true },
    avatar: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        if (ret) {
          delete (ret as any).password;
          delete (ret as any).refreshToken;
        }
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await hashPass(this.password);
  }
  if (this.refreshToken && this.isModified("refreshToken")) {
    this.refreshToken = await hashToken(this.refreshToken);
  }
  next();
});

userSchema.methods.comparePassword = async function (val: string) {
  return compareVal(val, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
