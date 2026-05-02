import mongoose from "mongoose";
import { Env } from "./env.config";
import UserModel from "../models/user.model";
import { sendMail } from "../utils/sendMail";
import ChatModel from "../models/chat.model";
import { getEnv } from "../utils/get-env";

const connectDatabase = async () => {
  try {
    mongoose.connection.on("connected", cleanupTask);
    await mongoose.connect(Env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

const CHECK_INTERVAL: number = 1000 * 60 * 60; // Once per hour
const GRACE_PERIOD: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Thirty days

const cleanupTask = async () => {
  try {
    const staleUsers = await UserModel.find({
      isVerified: false,
      createdAt: { $lt: GRACE_PERIOD },
      _id: { $ne: getEnv("SYSTEM_USER_ID") },
    });

    if (staleUsers.length > 0) {
      for (const user of staleUsers) {
        sendMail({
          to: user.email!,
          subject: "Your account has been deleted",
          text: "Your account on Messenger Application has been deleted due to inactivity",
        });
      }

      const ids = staleUsers.map((u) => u._id);
      await UserModel.deleteMany({ _id: { $in: ids } });
      console.log(`Deleted ${staleUsers.length} unverified users.`);
    }

    const chatResult = await ChatModel.deleteMany({
      participants: { $size: 0 },
      updatedAt: { $lt: GRACE_PERIOD },
    });

    if (chatResult.deletedCount > 0) {
      console.log(`Deleted ${chatResult.deletedCount} empty chats.`);
    }
  } catch (err) {
    console.error("Cleanup task failed:", err);
  } finally {
    setTimeout(cleanupTask, CHECK_INTERVAL);
  }
};

export default connectDatabase;
