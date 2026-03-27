export const USER_POPULATE_CONFIG = [
  {
    path: "favorites",
    select: "groupName isGroup avatar lastMessage lastReaction",
    populate: [
      {
        path: "participants",
        select: "name avatar blocked",
      },
      {
        path: "administrators",
        select: "name avatar",
      },
      {
        path: "lastMessage",
        populate: { path: "sender", select: "name avatar" },
      },
      {
        path: "lastReaction",
        populate: { path: "reactor", select: "name" },
      },
    ],
  },
];
