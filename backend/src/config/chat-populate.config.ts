export const CHAT_POPULATE_CONFIG = [
  { path: "participants", select: "name avatar isAI" },
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
  { path: "participants", select: "name avatar isAI blocked" },
  { path: "administrators", select: "name avatar" },
  {
    path: "lastMessage",
    populate: { path: "sender", select: "name avatar" },
  },
  {
    path: "lastReaction",
    populate: { path: "reactor", select: "name" },
  },
];
