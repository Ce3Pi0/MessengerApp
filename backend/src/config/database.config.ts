import mongoose from "mongoose";
import mdq from "mongo-date-query";
import { Env } from "./env.config";
import UserModel from "../models/user.model";
import { sendMail } from "../utils/sendMail";

const connectDatabase = async () => {
  try {
    mongoose.connection.on("connected", checkUsers);
    await mongoose.connect(Env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

const CHECK_INTERVAL: number = 5000;
const GRACE_PERIOD: number = 30;

const checkUsers = () => {
  UserModel.findOne({
    isVerified: false,
    createdAt: mdq.beforeLastDays(GRACE_PERIOD),
  }).then((user) => {
    if (user) {
      console.log(`User with pending deletion found (email: ${user.email})`);
      sendMail({
        from: Env.SENDER_EMAIL,
        to: user.email,
        subject: "Your account has been deleted",
        text: "Your account on Messenger Application has been deleted due to inactivity",
      });
      return UserModel.findByIdAndDelete(user.id);
    }
  });

  setTimeout(checkUsers, CHECK_INTERVAL);
};

export default connectDatabase;
