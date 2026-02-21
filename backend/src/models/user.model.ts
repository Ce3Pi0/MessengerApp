import mongoose, { Document, Schema } from "mongoose";
import { comparePassword, hashPassword } from "../utils/bcrypt";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
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
    password: { type: String, required: true },
    avatar: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        if (ret) {
          delete (ret as any).password;
        }
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await hashPassword(this.password);
  }
  next();
});

userSchema.methods.comparePassword = async function (val: string) {
  return comparePassword(val, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
