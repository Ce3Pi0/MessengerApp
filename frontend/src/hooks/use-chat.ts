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
import { useAuth } from "./use-auth";
import { generateUUID } from "@/lib/helper";

interface ChatState {
  chats: ChatType[];
  nextChatsCursor: string | null;
  users: UserType[];
  singleChat: {
    chat: ChatType;
    messages: MessageType[];
    next: string | null;
  } | null;

  gettingMoreMessages: boolean;
  gettingMoreChats: boolean;
  isChatLoading: boolean;
  isUsersLoading: boolean;
  isCreatingChat: boolean;
  isSingleChatLoading: boolean;

  fetchAllUsers: () => void;
  // TODO: Implement pagination getting
  fetchChats: () => void;
  fetchExtraChats: () => void;
  createChat: (data: CreateChatType) => Promise<ChatType | null>;
  fetchSingleChat: (chatId: string) => void;
  fetchExtraMessages: (chatId: string) => void;
  addNewChat: (newChat: ChatType) => void;
  updateChatLastMessage: (chatId: string, lastMessage: MessageType) => void;
  sendMessage: (data: CreateMessageType) => void;
  addNewMessage: (chatId: string, message: MessageType) => void;
  editMessage: (chatId: string, message: MessageType) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
}

export const useChat = create<ChatState>()((set, get) => ({
  chats: [],
  nextChatsCursor: null,
  users: [],
  singleChat: null,

  gettingMoreMessages: false,
  gettingMoreChats: false,
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
      set({ nextChatsCursor: data.next });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch chats");
    } finally {
      set({ isChatLoading: false });
    }
  },
  fetchExtraChats: async () => {
    set({ gettingMoreChats: true });
    try {
      const cursor = get().nextChatsCursor;
      if (!cursor) return;

      const { data } = await API.get(`/chat/all?cursor=${cursor}`);
      set((state) => {
        return {
          chats: [...state.chats, ...data.chats],
          nextChatsCursor: data.next,
        };
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch more chats");
    } finally {
      set({ gettingMoreChats: false });
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
      const { data } = await API.get(`/chat/${chatId}`);
      set({ singleChat: data });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch the chat");
    } finally {
      set({ isSingleChatLoading: false });
    }
  },
  fetchExtraMessages: async (chatId) => {
    set({ gettingMoreMessages: true });
    try {
      const chat = get().singleChat;
      const cursor = chat?.next;

      if (!cursor) return;

      const { data } = await API.get(`/chat/${chatId}?cursor=${cursor}`);

      set((state) => {
        if (state.singleChat?.chat._id !== chatId) return state;
        return {
          singleChat: {
            ...state.singleChat,
            messages: [...data.messages, ...state.singleChat.messages],
            next: data.next,
          },
        };
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to fetch more messages",
      );
    } finally {
      set({ gettingMoreMessages: false });
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
  updateChatLastMessage: (chatId: string, lastMessage: MessageType) => {
    set((state) => {
      const chat = state.chats.find((c) => c._id === chatId);
      if (!chat) return state;
      return {
        chats: [
          { ...chat, lastMessage },
          ...state.chats.filter((c) => c._id !== chat._id),
        ],
      };
    });
  },
  addNewMessage: (chatId, message) => {
    const data = get().singleChat;
    if (data?.chat._id === chatId)
      set({
        singleChat: {
          chat: data.chat,
          messages: [...data.messages, message],
          next: data.next,
        },
      });
  },
  editMessage: (chatId, message) => {
    const data = get().singleChat;

    const updatedMessages = data?.messages.map((m) => {
      if (m._id === message._id && m.content !== message.content)
        m.content = message.content;
      return m;
    });

    if (data?.chat._id === chatId)
      set({
        singleChat: {
          chat: data.chat,
          messages: updatedMessages ?? [],
          next: data.next,
        },
      });
  },

  deleteMessage: (chatId, messageId) => {
    const data = get().singleChat;

    const updatedMessages = data?.messages.filter((m) => m._id !== messageId);

    if (data?.chat._id === chatId)
      set({
        singleChat: {
          chat: data.chat,
          messages: [...(updatedMessages ?? [])],
          next: data.next,
        },
      });
  },
  sendMessage: async (data: CreateMessageType) => {
    const { chatId, replyTo, content, image } = data;
    const { user } = useAuth.getState();

    if (!chatId || !user?._id) return;

    const tempMsgId = generateUUID();

    const tempMessage = {
      _id: tempMsgId,
      chatId,
      content: content || "",
      image: image || null,
      sender: user,
      replyTo: replyTo || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "sending",
    };

    set((state) => {
      if (state.singleChat?.chat._id !== chatId) return state;
      return {
        singleChat: {
          ...state.singleChat,
          messages: [...state.singleChat.messages, tempMessage],
        },
      };
    });
    try {
      const { data } = await API.post("/message/send", {
        chatId,
        content,
        image,
        replyToId: replyTo?._id,
      });

      const { newMessage } = data;

      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            ...state.singleChat,
            messages: state.singleChat.messages.map((msg) =>
              msg._id === tempMsgId ? newMessage : msg,
            ),
          },
        };
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send message");
    }
  },
}));
