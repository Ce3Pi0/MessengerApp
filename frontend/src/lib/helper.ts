import { useSocket } from "@/hooks/use-socket";
import { API } from "./axios-client";
import type { UserType } from "@/types/auth.type";

export const isUserOnline = (userId?: string): boolean => {
  if (!userId) return false;
  const { onlineUsers } = useSocket.getState();
  return onlineUsers.includes(userId);
};

export const handleRefresh = async (set: any) => {
  await API.put("/auth/refresh");
  const res = await API.get("/auth/status");
  set({ user: res.data.user });
  useSocket.getState().connectSocket();
};

export const accessTokenExpiredError = (err: any, user: UserType | null) =>
  err.response?.status === 401 &&
  err.response?.data?.message === "Missing token" &&
  user;
