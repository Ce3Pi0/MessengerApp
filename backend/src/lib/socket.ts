import { Server as HTTPServer } from "http";
import { Server, type Socket } from "socket.io";
import { Env } from "../config/env.config";
import { jwtVerify } from "../utils/jwt-tokens";
import { validateChatParticipant } from "../services/chats.service";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: Server | null = null;

const onlineUsers = new Map<string, string>();

export const initializeSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: Env.FRONTEND_URL.slice(0, -1), // Avoids the trailing /
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("Unauthorized"));

      if (!rawCookie.includes("accessToken="))
        return next(new Error("Unauthorized"));

      const token = rawCookie?.split(";")[0].split("=")[1];

      if (!token) return next(new Error("Access token missing"));

      const decodedToken = jwtVerify(token, Env.JWT_ACCESS_SECRET);
      if (!decodedToken) return next(new Error("Unauthorized"));

      socket.userId = decodedToken.id;
      next();
    } catch (err) {
      next(new Error("Internal server error"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    if (!socket.userId) {
      socket.disconnect(true);
      return;
    }

    const userId = socket.userId!;
    const newSocketId = socket.id;

    console.log("socket connected: ", { userId, newSocketId });

    //Register online users
    onlineUsers.set(userId, newSocketId);

    //Broadcast online users to all sockets
    io?.emit("online:users", Array.from(onlineUsers.keys()));

    //create personal room for user
    socket.join(`user:${userId}`);

    socket.on(
      "chat:join",
      async (chatId: string, callback?: (err?: string) => void) => {
        try {
          await validateChatParticipant(chatId, userId);
          console.log(`User ${userId} joined room chat: ${chatId}`);
          socket.join(`chat:${chatId}`);
          callback?.();
        } catch (err) {
          callback?.("Error joining chat");
        }
      },
    );

    socket.on("chat:leave", (chatId: string) => {
      if (chatId) {
        socket.leave(`chat:${chatId}`);
        console.log(`User ${userId} left room chat: ${chatId}`);
      }
    });

    socket.on("disconnect", () => {
      if (onlineUsers.get(userId) === newSocketId) {
        onlineUsers.delete(userId);

        io?.emit("online:users", Array.from(onlineUsers.keys()));

        console.log("socket disconnected", {
          userId,
          newSocketId,
        });
      }
    });
  });
};

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export const emitNewChatToParticipants = (
  participantIds: string[] = [],
  chat: any,
) => {
  const io = getIO();
  for (const participantId of participantIds) {
    io.to(`user:${participantId}`).emit("chat:new", chat);
  }
};

export const emitNewMessageToChatRoom = (
  senderId: string,
  chatId: string,
  message: any,
) => {
  const io = getIO();
  const senderSocketId = onlineUsers.get(senderId.toString());

  if (senderSocketId) {
    io.to(`chat:${chatId}`).except(senderSocketId).emit("message:new", message);
  } else {
    io.to(`chat:${chatId}`).emit("message:new", message);
  }
};

export const emitUpdatedMessageToChatRoom = (
  senderId: string,
  chatId: string,
  message: any,
) => {
  const io = getIO();
  const senderSocketId = onlineUsers.get(senderId.toString());

  if (senderSocketId) {
    io.to(`chat:${chatId}`)
      .except(senderSocketId)
      .emit("message:update", message);
  } else {
    io.to(`chat:${chatId}`).emit("message:update", message);
  }
};

export const emitDeletedMessageToChatRoom = (
  senderId: string,
  chatId: string,
  messageId: string,
) => {
  const io = getIO();
  const senderSocketId = onlineUsers.get(senderId.toString());

  if (senderSocketId) {
    io.to(`chat:${chatId}`)
      .except(senderSocketId)
      .emit("message:delete", messageId);
  } else {
    io.to(`chat:${chatId}`).emit("message:delete", messageId);
  }
};

export const emitUpdatedReactionToChatRoom = (
  reactionId: string,
  reactor: any,
  chatId: string,
  messageId: string,
  emoji: string,
) => {
  const io = getIO();
  const senderSocketId = onlineUsers.get(reactor._id.toString());

  if (senderSocketId) {
    io.to(`chat:${chatId}`)
      .except(senderSocketId)
      .emit("reaction:update", reactionId, messageId, reactor, emoji);
  } else {
    io.to(`chat:${chatId}`).emit(
      "reaction:update",
      reactionId,
      messageId,
      reactor,
      emoji,
    );
  }
};

export const emitDeletedReactionToChatRoom = (
  reactorId: string,
  chatId: string,
  messageId: string,
  reactionId: string,
) => {
  const io = getIO();
  const senderSocketId = onlineUsers.get(reactorId.toString());

  if (senderSocketId) {
    io.to(`chat:${chatId}`)
      .except(senderSocketId)
      .emit("reaction:delete", messageId, reactionId);
  } else {
    io.to(`chat:${chatId}`).emit("reaction:delete", messageId, reactionId);
  }
};

export const emitLastUpdateToParticipant = (
  participantIds: string[],
  chatId: string,
  lastReaction: any = null,
  lastMessage: any = null,
) => {
  const io = getIO();
  const payload = { chatId, lastMessage, lastReaction };

  for (const participantId of participantIds) {
    io.to(`user:${participantId}`).emit("chat:update", payload);
  }
};

export const emitChatUpdateToParticipants = (
  userId: string,
  participantIds: string[],
  chat: any,
) => {
  const io = getIO();
  const userSocketId = onlineUsers.get(userId.toString());

  if (userSocketId)
    for (const participantId of participantIds) {
      io.to(`user:${participantId}`)
        .except(userSocketId)
        .emit("chat:change", chat);
    }
  else
    for (const participantId of participantIds) {
      io.to(`user:${participantId}`).emit("chat:change", chat);
    }
};

export const emitChatDeletedToParticipants = (
  participantIds: string[],
  chatId: string,
  userId: string,
) => {
  const io = getIO();
  const userSocketId = onlineUsers.get(userId.toString());

  if (userSocketId)
    for (const participantId of participantIds) {
      io.to(`user:${participantId}`)
        .except(userSocketId)
        .emit("chat:delete", chatId);
    }
  else
    for (const participantId of participantIds) {
      io.to(`user:${participantId}`).emit("chat:delete", chatId);
    }
};

export const emitUserRemovedToParticipants = (
  userId: string,
  participantIds: string[],
  chatName: string,
  chatId: string,
  removedUserId: string,
) => {
  const io = getIO();
  const userSocketId = onlineUsers.get(userId.toString());

  if (userSocketId && removedUserId === userId)
    for (const participantId of participantIds) {
      io.to(`user:${participantId}`)
        .except(userSocketId)
        .emit("user:remove", chatId, chatName, removedUserId);
    }
  else
    for (const participantId of participantIds) {
      io.to(`user:${participantId}`).emit(
        "user:remove",
        chatId,
        chatName,
        removedUserId,
      );
    }
};

export const emitUserAddedToParticipants = (
  userId: string,
  participantIds: string[],
  chatId: string,
  participant: any,
) => {
  const io = getIO();
  const userSocketId = onlineUsers.get(userId.toString());

  if (userSocketId) {
    for (const participantId of participantIds) {
      io.to(`user:${participantId}`)
        .except(userSocketId)
        .emit("user:add", chatId, participant);
    }
  } else {
    for (const participantId of participantIds) {
      io.to(`user:${participantId}`).emit("user:add", chatId, participant);
    }
  }
};

export const emitChatToNewParticipant = (participantId: string, chat: any) => {
  const io = getIO();
  io.to(`user:${participantId}`).emit("chat:new", chat);
};

export const emitReadMessageToParticipants = (
  user: any,
  participantIds: string[],
  messageId: string,
) => {
  const io = getIO();
  const userSocketId = onlineUsers.get(user._id.toString());
  const payload = { user, messageId };

  if (userSocketId) {
    for (const participantId of participantIds) {
      io.to(`user:${participantId}`)
        .except(userSocketId)
        .emit("message:seen", payload);
    }
  } else {
    for (const participantId of participantIds) {
      io.to(`user:${participantId}`).emit("message:seen", payload);
    }
  }
};

export const emitReadMessagesToParticipants = (
  user: any,
  participantIds: string[],
  seenMessages: string[],
) => {
  const io = getIO();
  const userSocketId = onlineUsers.get(user._id.toString());
  const payload = { user, seenMessages };

  if (userSocketId) {
    for (const participantId of participantIds) {
      io.to(`user:${participantId}`)
        .except(userSocketId)
        .emit("messages:seen", payload);
    }
  } else {
    for (const participantId of participantIds) {
      io.to(`user:${participantId}`).emit("messages:seen", payload);
    }
  }
};

export const emitBlockedToUser = (userId: string, participantId: string) => {
  const io = getIO();
  io.to(`user:${participantId}`).emit("user:blocked", userId);
};

export const emitUnblockedToUser = (user: any, participantId: string) => {
  const io = getIO();
  io.to(`user:${participantId}`).emit("user:unblocked", user);
};
