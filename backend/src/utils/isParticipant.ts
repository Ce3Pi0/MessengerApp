export const isParticipant = (userId: string, participants: string[]) => {
  return participants.includes(userId);
};
