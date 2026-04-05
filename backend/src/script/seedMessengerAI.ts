import "dotenv/config";
import connectDatabase from "../config/database.config";
import UserModel from "../models/user.model";

export const CreateMessengerAI = async () => {
  let messengerAi = await UserModel.findOne({ isAI: true });
  if (messengerAi) {
    return messengerAi;
  }

  messengerAi = await UserModel.create({
    name: "Messenger AI",
    email: undefined,
    isAI: true,
    isVerified: true,
    avatar:
      "https://res.cloudinary.com/dyw7ptu4f/image/upload/v1775361901/GAIA_Logo_yqoph6.webp",
    provider: "local",
  });

  return messengerAi;
};

const seedMessengerAI = async () => {
  try {
    await connectDatabase();
    await CreateMessengerAI();
    console.log("Messenger AI seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding Messenger AI:", error);
    process.exit(1);
  }
};

seedMessengerAI();
