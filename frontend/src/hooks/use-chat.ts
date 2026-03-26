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
  isDeletingChat: boolean;
  isSingleChatLoading: boolean;
  isUserAdding: boolean;
  isUserRemoving: boolean;

  setChats: (data: {
    newChats: ChatType[] | null;
    newNext: string | null;
  }) => void;
  fetchUsers: () => void;
  fetchExtraUsers: () => void;
  fetchChats: () => void;
  fetchExtraChats: () => void;
  createChat: (data: CreateChatType) => Promise<ChatType | null>;
  fetchSingleChat: (chatId: string) => void;
  fetchExtraMessages: (chatId: string) => void;
  addNewChat: (newChat: ChatType) => void;
  deleteChat: (chatId: string) => void;
  sendDeleteChat: (chatId: string) => void;
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

  sendUpdateChatName: (chatId: string, groupName: string) => void;
  sendUpdateChatAvatar: (chatId: string, chatAvatar: string) => void;
  sendPromoteUser: (chatId: string, userToBePromotedId: string) => void;
  sendFavoriteChat: (chatId: string) => void;
  sendUnfavoriteChat: (chatId: string) => void;

  changeChat: (chat: ChatType) => void;

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
  addUser: (chatId: string, participant: UserType) => void;
  sendAddUser: (chatId: string, participantId: string) => void;
  removeUser: (
    chatId: string,
    chatName: string,
    removedUserId: string,
  ) => boolean;
  sendRemoveUser: (chatId: string, userToRemoveId: string) => void;

  sendBlockUser: (userToBeBlockedId: string) => void;
  blockUser: (blockedById: string) => void;
  sendUnblockUser: (userToBeUnblockedId: string) => void;
  unblockUser: (unblockedBy: UserType) => void;
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
  isDeletingChat: false,
  isSingleChatLoading: false,
  isUserAdding: false,
  isUserRemoving: false,

  setChats: ({ newChats, newNext }) =>
    set((state) => ({
      ...state,
      chats: [...(newChats ?? [])],
      nextChatsCursor: newNext,
    })),
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
  addNewChat: (newChat: ChatType) => {
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
  deleteChat: (chatId: string) => {
    set((state) => {
      const updatedChats = state.chats.filter((chat) => chat._id !== chatId);
      return {
        chats: [...updatedChats],
      };
    });
  },
  sendDeleteChat: async (chatId: string) => {
    set({ isDeletingChat: true });
    try {
      await API.delete(`/chat/delete/${chatId}`);
      set({ singleChat: null });

      const updatedChats = get().chats.filter((chat) => chat._id !== chatId);

      set({ chats: [...updatedChats] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete the chat");
    } finally {
      set({ isDeletingChat: false });
    }
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
  // TODO: Implement logic
  sendUpdateChatName: async (chatId, groupName) => {},
  // TODO: Implement logic
  sendUpdateChatAvatar: async (chatId, chatAvatar) => {},
  // TODO: Implement logic
  sendPromoteUser: async (chatId, userToBePromotedId) => {
    try {
      const { data } = await API.put(`/chat/add-admin/${chatId}`, {
        userToBePromotedId,
      });
      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            ...state.singleChat,
            chat: data.updatedChat,
          },
        };
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to promote user");
    }
  },
  // TODO: Implement logic
  sendFavoriteChat: async (chatId) => {},
  // TODO: Implement logic
  sendUnfavoriteChat: async (chatId) => {},
  changeChat: (chat) => {
    if (chat._id === get().singleChat?.chat._id) {
      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            ...state.singleChat,
            chat,
          },
        };
      });
    }
    set((state) => {
      if (!state.chats) return state;
      return {
        chats: [
          ...state.chats.map((c) => {
            if (c._id === chat._id) return chat;
            return c;
          }),
        ],
      };
    });
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
  addUser: (chatId: string, participant: UserType) => {
    if (chatId === get().singleChat?.chat._id) {
      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            chat: {
              ...state.singleChat.chat,
              participants: [
                ...(state.singleChat?.chat.participants ?? []),
                participant,
              ],
            },
            messages: state.singleChat.messages,
            next: state.singleChat.next,
          },
        };
      });
    }
  },
  sendAddUser: async (chatId: string, participantId: string) => {
    set({ isUserAdding: true });
    try {
      const res = await API.post("/chat/add-user", {
        chatId,
        participantId,
      });

      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            chat: {
              ...state.singleChat.chat,
              participants: [...(res.data?.updatedChat.participants ?? [])],
            },
            messages: state.singleChat.messages,
            next: state.singleChat.next,
          },
        };
      });
      toast.success(res?.data?.message || "User added successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "User couldn't be added to the chat",
      );
    } finally {
      set({ isUserAdding: false });
    }
  },
  removeUser: (chatId, chatName, removedUserId) => {
    const { user } = useAuth.getState();

    if (chatId !== get().singleChat?.chat._id) {
      set((state) => {
        if (!state.chats) return state;
        return {
          chats: [...state.chats.filter((chat) => chat._id !== chatId)],
        };
      });

      return false;
    }

    set((state) => {
      if (!state.singleChat) return state;
      return {
        singleChat: {
          chat: {
            ...state.singleChat.chat,
            participants: [
              ...(state.singleChat?.chat.participants ?? []).filter(
                (participant) => participant._id !== removedUserId,
              ),
            ],
            administrators: [
              ...(state.singleChat?.chat.administrators ?? []).filter(
                (administrator) => administrator._id !== removedUserId,
              ),
            ],
          },
          messages: state.singleChat.messages,
          next: state.singleChat.next,
        },
      };
    });

    if (user?._id !== removedUserId) return false;

    set((state) => {
      return {
        chats: [...state.chats.filter((chat) => chat._id !== chatId)],
      };
    });

    toast.info(`You have been removed from ${chatName}`);

    return true;
  },
  sendRemoveUser: async (chatId, userToRemoveId) => {
    set({ isUserRemoving: true });
    try {
      const res = await API.delete("/chat/remove-user", {
        data: {
          chatId,
          userToRemoveId,
        },
      });

      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            chat: {
              ...state.singleChat.chat,
              participants: [
                ...(state.singleChat?.chat.participants ?? []).filter(
                  (participant) => participant._id !== userToRemoveId,
                ),
              ],
            },
            messages: state.singleChat.messages,
            next: state.singleChat.next,
          },
        };
      });

      const { user } = useAuth.getState();

      if (user?._id !== userToRemoveId)
        toast.success(res?.data?.message || "User removed successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "User couldn't be removed from the chat",
      );
    } finally {
      set({ isUserRemoving: false });
    }
  },
  sendBlockUser: async (userToBeBlockedId) => {
    try {
      const res = await API.put("/users/block-user", { userToBeBlockedId });

      useAuth.getState().blockUser(userToBeBlockedId);

      set((state) => {
        if (!state.chats) return state;
        return {
          singleChat: null,
          chats:
            state.chats?.filter(
              (chat) =>
                chat.isGroup ||
                !chat.participants.find((p) => p._id === userToBeBlockedId),
            ) || [],
        };
      });

      toast.success(res?.data?.message || "User blocked successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "User could not be blocked");
    }
  },
  blockUser: (blockedById) => {
    const { user } = useAuth.getState();

    if (!user) return;

    if (
      !get().singleChat?.chat.isGroup &&
      get().singleChat?.chat.participants.find((p) => p._id === blockedById)
    ) {
      set((state) => {
        if (!state.singleChat || !state.users) return state;

        return {
          ...state,
          singleChat: {
            ...state.singleChat,
            chat: {
              ...state.singleChat.chat,
              participants: state.singleChat.chat.participants.map((p) => {
                if (p._id === blockedById) {
                  return {
                    ...p,
                    blocked: p.blocked ? [...p.blocked, user._id] : [user._id],
                  };
                }
                return p;
              }),
            },
          },
          users: state.users.filter((u) => u._id !== blockedById),
        };
      });

      console.log(get().singleChat?.chat);
    }
  },
  sendUnblockUser: async (userToBeUnblockedId) => {
    try {
      const res = await API.put("/users/unblock-user", { userToBeUnblockedId });

      useAuth.getState().unblockUser(userToBeUnblockedId);

      set((state) => {
        if (!state.chats) return state;
        return {
          singleChat: null,
          chats: [res.data?.chat, ...state.chats],
        };
      });

      toast.success(res?.data?.message || "User unblocked successfully!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "User could not be unblocked",
      );
    }
  },
  unblockUser: (unblockedBy) => {
    const { user } = useAuth.getState();
    if (!user || !get().singleChat) return;

    if (
      !get().singleChat?.chat.isGroup &&
      get().singleChat?.chat.participants.find((p) => p._id === unblockedBy._id)
    ) {
      set((state) => {
        if (!state.singleChat) return state;

        return {
          ...state,
          singleChat: {
            ...state.singleChat,
            chat: {
              ...state.singleChat.chat,
              participants: state.singleChat.chat.participants.map((p) => {
                if (p._id === unblockedBy._id) {
                  return {
                    ...p,
                    blocked: p.blocked?.filter((b) => b !== user._id) || [],
                  };
                }
                return p;
              }),
            },
          },
          users: [unblockedBy, ...state.users],
        };
      });
    }
  },
}));
