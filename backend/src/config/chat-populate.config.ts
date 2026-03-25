export const CHAT_POPULATE_CONFIG = [
  { path: "participants", select: "name avatar" },
  {
    path: "lastMessage",
    populate: { path: "sender", select: "name avatar" },
  },
  {
    path: "lastReaction",
    populate: { path: "reactor", select: "name" },
  },
];

export const SINGLE_CHAT_POPULATE_CONFIG = [
  { path: "participants", select: "name avatar" },
  { path: "administrators", select: "name avatar" },
];
