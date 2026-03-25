import UserModel from "../models/user.model";
import { BadRequestException } from "./app-error";

export const checkIfBlocked = async (chat: any, user: any) => {
  if (!chat.isGroup) {
    const otherUserId = chat.participants.filter(
      (p: any) => p._id === user._id,
    )[0];

    const otherUser = await UserModel.findById(otherUserId);

    if (otherUser && otherUser.blocked.includes(user._id))
      throw new BadRequestException("The user has blocked you");
  }
};
