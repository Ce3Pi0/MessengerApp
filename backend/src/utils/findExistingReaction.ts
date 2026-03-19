export const findExistingReaction = (msg: any, userId: string) => {
  return (msg.reactions as any[]).find((r) => r.reactor.toString() === userId);
};
