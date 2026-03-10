import { API } from "@/lib/axios-client";
import type { UserType } from "@/types/auth.type";
import type {
  ChatType,
  CreateChatType,
  CreateMessageType,
  MessageType,
} from "@/types/chat.types";
import { toast } from "sonner";
import { create } from "zustand";

interface ChatState {
  chats: ChatType[];
  users: UserType[];
  singleChat: {
    chat: ChatType;
    messages: MessageType[];
  } | null;

  isChatLoading: boolean;
  isUsersLoading: boolean;
  isCreatingChat: boolean;
  isSingleChatLoading: boolean;

  fetchAllUsers: () => void;
  fetchChats: () => void;
  createChat: (data: CreateChatType) => Promise<ChatType | null>;
  fetchSingleChat: (chatId: string) => void;
  addNewChat: (newChat: ChatType) => void;
  sendMessage: (data: CreateMessageType) => void;
}

export const useChat = create<ChatState>()((set, get) => ({
  chats: [],
  users: [],
  singleChat: null,

  isChatLoading: false,
  isUsersLoading: false,
  isCreatingChat: false,
  isSingleChatLoading: false,

  fetchAllUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const { data } = await API.get("/users/all");
      set({ users: data.users });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  fetchChats: async () => {
    set({ isChatLoading: true });
    try {
      const { data } = await API.get("/chat/all");
      set({ chats: data.chats });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch chats");
    } finally {
      set({ isChatLoading: false });
    }
  },
  createChat: async (data: CreateChatType) => {
    set({ isCreatingChat: true });
    try {
      const res = await API.post("/chat/create", { ...data });
      get().addNewChat(res.data.chat);
      toast.success("Chat created successfully!");
      return res.data.chat;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create a chat");
      return null;
    } finally {
      set({ isCreatingChat: false });
    }
  },
  fetchSingleChat: async (chatId: string) => {
    set({ isSingleChatLoading: true });
    try {
    } catch (err: any) {
    } finally {
      set({ isSingleChatLoading: false });
    }
  },
  addNewChat: async (newChat: ChatType) => {
    set((state) => {
      const existingChatIndex = state.chats.findIndex(
        (c) => c._id === newChat._id,
      );
      if (existingChatIndex !== -1)
        //Move the chat to the top
        return {
          chats: [newChat, ...state.chats.filter((c) => c._id !== newChat._id)],
        };
      else
        //Create the chat
        return {
          chats: [newChat, ...state.chats],
        };
    });
  },
  sendMessage: (data: CreateMessageType) => {},
}));
