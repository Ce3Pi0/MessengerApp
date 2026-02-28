import UserModel from "../models/user.model";
import { NotAllowedException, NotFoundException } from "./app-error";

const MAX_GROUP_MEMBERS: number = 50;

export const checkParticipants = async (participants: string[]) => {
  if (participants?.length > MAX_GROUP_MEMBERS)
    throw new NotAllowedException(
      `Max number of participants is ${MAX_GROUP_MEMBERS}`,
    );

  for (let participant of participants) {
    const participantUser = await UserModel.findById(participant);
    if (!participantUser) throw new NotFoundException("User not found");
  }
};
