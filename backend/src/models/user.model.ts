import mongoose, { Document, Schema, UpdateQuery } from "mongoose";
import { comparePass, compareVal, hashPass, hashToken } from "../utils/bcrypt";
import { UnprocessableEntityException } from "../utils/app-error";

type Providers = "local" | "google" | "merged";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  refreshToken?: string;
  provider: Providers;
  isVerified: boolean;
  forgotPassword: boolean;
  avatar?: string | null;
  enabled2fa: boolean;
  secret2fa?: string;
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
    provider: {
      type: String,
      enum: ["local", "google", "merged"],
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    forgotPassword: { type: Boolean, default: false },
    avatar: { type: String, default: null },
    enabled2fa: { type: Boolean, default: false },
    secret2fa: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        if (ret) {
          delete (ret as any).password;
          delete (ret as any).refreshToken;
          delete (ret as any).secret2fa;
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

userSchema.methods.comparePassword = async function (pass: string) {
  return comparePass(pass, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
