import { API } from "@/lib/axios-client";
import type { UserType } from "@/types/auth.type";
import type {
  ChatType,
  CreateChatType,
  CreateMessageType,
  MessageType,
  ReactionDataType,
} from "@/types/chat.types";
import { toast } from "sonner";
import { create } from "zustand";
import { useAuth } from "./use-auth";
import { generateUUID } from "@/lib/helper";

interface ChatState {
  chats: ChatType[];
  nextChatsCursor: string | null;
  nextUsersCursor: string | null;
  users: UserType[];
  singleChat: {
    chat: ChatType;
    messages: MessageType[];
    next: string | null;
  } | null;

  gettingMoreMessages: boolean;
  gettingMoreChats: boolean;
  gettingMoreUsers: boolean;
  isChatLoading: boolean;
  isUsersLoading: boolean;
  isCreatingChat: boolean;
  isSingleChatLoading: boolean;

  fetchUsers: () => void;
  fetchExtraUsers: () => void;
  fetchChats: () => void;
  fetchExtraChats: () => void;
  createChat: (data: CreateChatType) => Promise<ChatType | null>;
  fetchSingleChat: (chatId: string) => void;
  fetchExtraMessages: (chatId: string) => void;
  addNewChat: (newChat: ChatType) => void;
  editMessage: (chatId: string, message: MessageType) => void;
  updateChatLastInfo: (
    chatId: string,
    lastMessage: MessageType | null,
    lastReaction: ReactionDataType | null,
  ) => void;
  sendMessage: (data: CreateMessageType) => void;
  addNewMessage: (chatId: string, message: MessageType) => void;
  sendEditMessage: (chatId: string, message: MessageType) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  sendDeleteMessage: (chatId: string, messageId: string) => void;

  addNewReaction: (
    reactionId: string,
    chatId: string,
    messageId: string,
    reactor: string,
    emoji: string,
  ) => void;
  sendReaction: (chatId: string, messageId: string, emoji: string) => void;

  deleteReaction: (
    chatId: string,
    messageId: string,
    reactionId: string,
  ) => void;
  sendDeleteReaction: (
    chatId: string,
    messageId: string,
    reactionId: string,
  ) => void;
}

export const useChat = create<ChatState>()((set, get) => ({
  chats: [],
  nextChatsCursor: null,
  nextUsersCursor: null,
  users: [],
  singleChat: null,

  gettingMoreMessages: false,
  gettingMoreChats: false,
  gettingMoreUsers: false,
  isChatLoading: false,
  isUsersLoading: false,
  isCreatingChat: false,
  isSingleChatLoading: false,

  fetchUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const { data } = await API.get("/users/all");
      set({ users: data.users });
      set({ nextUsersCursor: data.next });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  fetchExtraUsers: async () => {
    set({ gettingMoreUsers: true });
    try {
      const cursor = get().nextUsersCursor;

      if (!cursor) return;

      const { data } = await API.get(`/users/all?cursor=${cursor}`);

      set((state) => {
        return {
          users: [...state.users, ...data.users],
          nextUsersCursor: data.next,
        };
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch more users");
    } finally {
      set({ gettingMoreUsers: false });
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
        return {
          chats: [newChat, ...state.chats.filter((c) => c._id !== newChat._id)],
        };
      else
        return {
          chats: [newChat, ...state.chats],
        };
    });
  },
  updateChatLastInfo: (
    chatId: string,
    lastMessage: MessageType | null,
    lastReaction: ReactionDataType | null,
  ) => {
    set((state) => {
      const chat = state.chats.find((c) => c._id === chatId);
      if (!chat) return state;
      return {
        chats: [
          { ...chat, lastMessage, lastReaction },
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

    const updatedMessages = data?.messages?.map((m) => {
      if (m._id === message._id) return message;
      m.replyTo = m.replyTo?._id === message._id ? message : m.replyTo;
      return m;
    });

    if (data?.chat._id === chatId)
      set({
        singleChat: {
          chat: data.chat,
          messages: [...(updatedMessages ?? [])],
          next: data.next,
        },
      });
  },
  sendEditMessage: async (chatId, message) => {
    try {
      const { data } = await API.put("/message/edit", {
        chatId,
        messageId: message._id,
        content: message.content,
      });

      const { newMessage } = data;

      const updatedMessages = get().singleChat?.messages?.map((m) => {
        if (m._id === newMessage._id) return newMessage;
        m.replyTo = m.replyTo?._id === newMessage._id ? newMessage : m.replyTo;
        return m;
      });

      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            ...state.singleChat,
            messages: [...(updatedMessages ?? [])],
          },
        };
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to edit the message");
    }
  },
  deleteMessage: (chatId, messageId) => {
    const data = get().singleChat;

    let updatedMessages = data?.messages.filter((m) => m._id !== messageId);
    updatedMessages = updatedMessages?.map((m) => {
      m.replyTo = m.replyTo?._id === messageId ? null : m.replyTo;
      return m;
    });

    if (data?.chat._id === chatId)
      set({
        singleChat: {
          chat: data.chat,
          messages: [...(updatedMessages ?? [])],
          next: data.next,
        },
      });
  },
  sendDeleteMessage: async (chatId, messageId) => {
    try {
      await API.delete("/message/delete", {
        data: {
          messageId,
          chatId,
        },
      });

      let updatedMessages = get().singleChat?.messages.filter(
        (m) => m._id !== messageId,
      );
      updatedMessages = updatedMessages?.map((m) => {
        m.replyTo = m.replyTo?._id === messageId ? null : m.replyTo;
        return m;
      });

      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            ...state.singleChat,
            messages: [...(updatedMessages ?? state.singleChat.messages)],
          },
        };
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to delete the message",
      );
    }
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
  addNewReaction: (
    reactionId: string,
    chatId: string,
    messageId: string,
    reactor: any,
    emoji: string,
  ) => {
    const data = get().singleChat;

    let messageToUpdate = data?.messages.find((msg) => msg._id === messageId);
    if (!messageToUpdate) return;

    let updatedMessageReactions: ReactionDataType[] = [];

    if (!messageToUpdate.reactions || messageToUpdate.reactions.length <= 0) {
      updatedMessageReactions.push({
        _id: reactionId,
        reactor,
        emoji,
      });
    } else {
      const userHasReacted = messageToUpdate.reactions.some(
        (reaction) => reaction.reactor._id === reactor._id,
      );

      if (userHasReacted) {
        updatedMessageReactions = messageToUpdate.reactions?.map((reaction) => {
          if (reaction._id === reactionId) {
            reaction.emoji = emoji;
            reaction.reactor = reactor;
          }
          return reaction;
        });
      } else {
        updatedMessageReactions = [
          ...messageToUpdate.reactions,
          {
            _id: reactionId,
            reactor,
            emoji,
          },
        ];
      }
    }

    messageToUpdate.reactions = [...updatedMessageReactions];

    const updatedMessages = data?.messages.map((message) =>
      message._id === messageToUpdate._id ? messageToUpdate : message,
    );

    if (data?.chat._id === chatId) {
      set({
        singleChat: {
          chat: data.chat,
          messages: [...(updatedMessages ?? [])],
          next: data.next,
        },
      });
    }
  },
  sendReaction: async (chatId: string, messageId: string, emoji: string) => {
    try {
      const { user } = useAuth.getState();

      if (!user) return;

      const tempReaction = {
        _id: generateUUID(),
        reactor: user,
        emoji,
      };

      let updatedMessages = get().singleChat?.messages?.map((m) => {
        if (m._id === messageId) {
          if (m.reactions && m.reactions.length > 0)
            m.reactions = m.reactions?.map((r) => {
              if (r.reactor._id !== user._id) return r;
              return tempReaction;
            });
          else m.reactions = [tempReaction];
        }
        return m;
      });
      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            ...state.singleChat,
            messages: [...(updatedMessages ?? [])],
          },
        };
      });

      const { data } = await API.post("/reaction/send", {
        chatId,
        messageId,
        emoji,
      });

      const { updatedMsg } = data;

      updatedMessages = get().singleChat?.messages?.map((m) => {
        if (m._id === updatedMsg._id) {
          m.reactions = updatedMsg.reactions;
        }
        return m;
      });

      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            ...state.singleChat,
            messages: [...(updatedMessages ?? [])],
          },
        };
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to react to message");
    }
  },
  deleteReaction: (chatId: string, messageId: string, reactionId: string) => {
    const data = get().singleChat;

    let messageToUpdate = data?.messages.find((msg) => msg._id === messageId);
    if (!messageToUpdate) return;

    const updatedMessageReactions = messageToUpdate.reactions?.filter(
      (reaction) => reaction._id !== reactionId,
    );

    messageToUpdate.reactions = updatedMessageReactions;

    const updatedMessages = data?.messages.map((message) =>
      message._id === messageToUpdate._id ? messageToUpdate : message,
    );

    if (data?.chat._id === chatId)
      set({
        singleChat: {
          chat: data.chat,
          messages: [...(updatedMessages ?? [])],
          next: data.next,
        },
      });
  },
  sendDeleteReaction: async (
    chatId: string,
    messageId: string,
    reactionId: string,
  ) => {
    try {
      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            ...state.singleChat,
            messages: state.singleChat.messages.map((m) => {
              if (m._id === messageId) {
                m.reactions = (m.reactions ?? []).filter(
                  (r) => r._id !== reactionId,
                );
              }
              return m;
            }),
          },
        };
      });

      await API.delete("/reaction/delete", {
        data: {
          chatId,
          messageId,
        },
      });

      let updatedMessages = get().singleChat?.messages.map((m) => {
        if (m._id !== messageId) return m;
        m.reactions = (m.reactions ?? []).filter(
          (reaction) => reaction._id !== reactionId,
        );
        return m;
      });

      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            ...state.singleChat,
            messages: [...(updatedMessages ?? state.singleChat.messages)],
          },
        };
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to delete the reaction",
      );
    }
  },
}));
