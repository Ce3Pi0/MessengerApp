import { useSocket } from "@/hooks/use-socket";
import { API } from "./axios-client";
import type { UserType } from "@/types/auth.type";

export const isUserOnline = (userId?: string): boolean => {
  if (!userId) return false;
  const { onlineUsers } = useSocket.getState();
  return onlineUsers.includes(userId);
};

export const handleRefresh = async (set: any): Promise<boolean> => {
  try {
    const res = await API.put("/auth/refresh");
    set(res.data.user);
    useSocket.getState().connectSocket();
    return true;
  } catch (err: any) {
    set({ user: null });
    return false;
  }
};

export const accessTokenExpiredError = (err: any, user: UserType | null) =>
  err.response?.status === 401 &&
  err.response?.data?.message === "Missing token" &&
  user;

export const fileToBase64 = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
