import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "@/hooks/use-socket";
import { API } from "./axios-client";
import type { UserType } from "@/types/auth.type";
import type { ChatType } from "@/types/chat.types";

export const isUserOnline = (userId?: string): boolean => {
  if (!userId) return false;
  const { onlineUsers } = useSocket.getState();
  return onlineUsers.includes(userId);
};

export const handleRefresh = async (
  setUsers: any,
  setChats: any,
): Promise<boolean> => {
  try {
    const res = await API.put("/auth/refresh");
    setUsers(res.data.user);
    setChats({ newChats: res.data.chats, newNext: res.data.next });
    useSocket.getState().connectSocket();
    return true;
  } catch (err: any) {
    setUsers({ user: null });
    setChats({ newChats: [], newNext: null });
    return false;
  }
};

export const accessTokenExpiredError = (err: any, user: UserType | null) =>
  err.response?.status === 401 &&
  (err.response?.data?.message === "Missing token" ||
    err.response?.data?.message === "Token expired") &&
  user;

export const fileToBase64 = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const getOtherUserAndGroup = (
  chat: ChatType,
  currentUserId: string | null,
) => {
  const isGroup = chat?.isGroup;

  if (isGroup) {
    return {
      name: chat.groupName || "Unnamed Group",
      subheading: `${chat.participants.length} members`,
      avatar: chat.avatar || "",
      isGroup,
    };
  }

  const other = chat?.participants.find((p) => p._id !== currentUserId);

  const isOnline = isUserOnline(other?._id ?? "");

  return {
    name: other?.name || "Unknown",
    subheading: isOnline ? "Online" : "Offline",
    avatar: other?.avatar || "",
    isGroup,
    isOnline,
  };
};

export const formatChatTime = (date: string | Date) => {
  if (!date) return "";
  const newDate = new Date(date);
  if (isNaN(newDate.getTime())) return "Invalid date";

  if (isToday(newDate)) return format(newDate, "h:mm a");
  if (isYesterday(newDate)) return "Yesterday";
  if (isThisWeek(newDate)) return format(newDate, "EEEE");

  return format(newDate, "M/d");
};

export const generateUUID = (): string => {
  return uuidv4();
};
