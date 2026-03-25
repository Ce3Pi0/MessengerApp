export const MESSAGE_POPULATE_CONFIG = [
  { path: "sender", select: "name avatar" },
  {
    path: "replyTo",
    select: "content image sender",
    populate: {
      path: "sender",
      select: "name avatar",
    },
  },
  {
    path: "reactions",
    populate: {
      path: "reactor",
      select: "name avatar",
    },
  },
];

export const NEW_MESSAGE_POPULATE_CONFIG = [
  { path: "sender", select: "name avatar" },
  {
    path: "replyTo",
    select: "content image sender",
    populate: {
      path: "sender",
      select: "name avatar",
    },
  },
];

export const REACTED_MESSAGE_POPULATE_CONFIG = [
  {
    path: "reactions",
    populate: {
      path: "reactor",
      select: "name avatar",
    },
  },
];
