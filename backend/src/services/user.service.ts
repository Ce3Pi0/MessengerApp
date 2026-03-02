import UserModel from "../models/user.model";
import { BadRequestException } from "../utils/app-error";

export const findByIdUserService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new BadRequestException("User not found");
  return user;
};

export const getUsersService = async (
  userId: string,
  cursor: string | undefined,
  limit: number = 10,
) => {
  const query: any = { _id: { $ne: userId } };

  if (cursor) {
    query._id = { ...query._id, $gt: cursor };
  }

  const users = await UserModel.find(query)
    .select("-password -refreshToken")
    .sort({ _id: 1 })
    .limit(limit);

  const nextCursor =
    users.length === limit ? users[users.length - 1]._id : null;

  return {
    users,
    nextCursor,
  };
};
