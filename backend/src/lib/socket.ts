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
      origin: "http://localhost:5173",
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
    socket.join(`users:${userId}`);

    socket.on(
      "chat:join",
      async (chatId: string, callback?: (err?: string) => void) => {
        try {
          await validateChatParticipant(chatId, userId);
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
    io.to(`user:${participantId}`).emit(`chat:new`, chat);
  }
};

export const emitNewMessageToChatRoom = (
  senderId: string,
  chatId: string,
  message: any,
) => {
  const io = getIO();
  const senderSocketId = onlineUsers.get(senderId);

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
  const senderSocketId = onlineUsers.get(senderId);

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
  const senderSocketId = onlineUsers.get(senderId);

  if (senderSocketId) {
    io.to(`chat:${chatId}`)
      .except(senderSocketId)
      .emit("message:delete", messageId);
  } else {
    io.to(`chat:${chatId}`).emit("message:delete", messageId);
  }
};

export const emitLastMessageToParticipant = (
  participantIds: string[],
  chatId: string,
  lastMessage: any,
) => {
  const io = getIO();
  const payload = { chatId, lastMessage };

  for (const participantId of participantIds) {
    io.to(`user:${participantId}`).emit("chat:update", payload);
  }
};
