import UserModel from "../models/user.model";
import { BadRequestException } from "../utils/app-error";

export const findByIdUserService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new BadRequestException("User not found");
  return user;
};

export const getUsersService = async (userId: string) => {
  const user = await UserModel.find({ _id: { $ne: userId } })
    .select("-password")
    .select("-refreshToken");
  if (!user) throw new BadRequestException("User not found");
  return user;
};
