export const MESSAGE_POPULATE_CONFIG = [
  { path: "sender", select: "name avatar isAI" },
  {
    path: "replyTo",
    select: "content image sender",
    populate: {
      path: "sender",
      select: "name avatar isAI",
    },
  },
  {
    path: "reactions",
    populate: {
      path: "reactor",
      select: "name avatar",
    },
  },
  {
    path: "readBy",
    select: "name avatar",
  },
];

export const SYSTEM_MESSAGE_POPULATE_CONFIG = [
  { path: "sender", select: "name" },
];

export const NEW_MESSAGE_POPULATE_CONFIG = [
  { path: "sender", select: "name avatar isAI" },
  {
    path: "replyTo",
    select: "content image sender",
    populate: {
      path: "sender",
      select: "name avatar isAI",
    },
  },
  {
    path: "readBy",
    select: "name avatar",
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

export const AI_CONTENT_POPULATE_CONFIG = [
  { path: "sender", select: "isAI" },
  {
    path: "replyTo",
    select: "content image sender",
    populate: { path: "sender", select: "content" },
  },
];

export const AI_MESSAGE_POPULATE_CONFIG = [
  { path: "sender", select: "name avatar isAI" },
];
