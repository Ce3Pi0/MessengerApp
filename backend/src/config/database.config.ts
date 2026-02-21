import mongoose from "mongoose";
import { Env } from "./env.config";

const connectDatabase = async () => {
  try {
    await mongoose.connect(Env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

export default connectDatabase;
