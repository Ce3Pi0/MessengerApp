import { API } from "@/lib/axios-client";
import type {
  ChangePasswordType,
  ForgotPasswordType,
  LoginType,
  RegisterType,
  ResendVerificationType,
  SetPasswordType,
  UpdatePasswordType,
  UpdateUserType,
  UserType,
  Verify2FAType,
} from "@/types/auth.type";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSocket } from "./use-socket";
import { accessTokenExpiredError, isUserOnline } from "@/lib/helper";
import type { ChatType } from "@/types/chat.types";

interface AuthState {
  user: UserType | null;
  isLoading: boolean;
  waitingMfa: boolean;
  isConfirmed: boolean | undefined;
  qrCode: string | null;

  setUser: (user: UserType | null) => void;
  register: (data: RegisterType) => Promise<boolean>;
  login: (data: LoginType) => Promise<boolean>;
  resendVerification: (data: ResendVerificationType) => void;
  logout: () => void;
  sendForgotPassword: (data: ForgotPasswordType) => void;
  updatePassword: (
    data: UpdatePasswordType,
    token: string | null,
  ) => Promise<boolean>;
  changePassword: (data: ChangePasswordType) => Promise<boolean>;
  setPassword: (data: SetPasswordType) => Promise<boolean>;
  enable2fa: () => void;
  verify2fa: (data: Verify2FAType) => Promise<boolean>;
  disable2fa: () => Promise<boolean>;
  isAuthStatus: () => void;
  updateAccount: (data: UpdateUserType) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;

  setFavoriteChats: (favorites: ChatType[]) => void;
  checkChatDeletion: (chatId: string) => void;

  blockUser: (userToBeBlockedId: string) => void;
  unblockUser: (userToBeUnblockedId: string) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      waitingMfa: false,
      isConfirmed: undefined,
      qrCode: null,

      setUser: (newUser: UserType | null) =>
        set((state) => ({
          ...state,
          user: newUser,
        })),
      register: async (data: RegisterType) => {
        set({ isLoading: true });

        try {
          await API.post("/auth/register", data);
          toast.success(
            "Registration successful! Please confirm your account and log in.",
          );
          return true;
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Register failed");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      login: async (data: LoginType) => {
        set({ isLoading: true, waitingMfa: false });

        try {
          const res = await API.post("/auth/login", data);

          set({ user: res.data.user, waitingMfa: res.data.mfaRequired });

          if (useAuth.getState().isConfirmed !== undefined)
            set({ isConfirmed: undefined });

          if (res.data.mfaRequired) {
            toast.success("Enter you 2FA code!");
            return true;
          } else {
            useSocket.getState().connectSocket();
            toast.success("Login successful!");
            return false;
          }
        } catch (err: any) {
          if (err.response?.data?.message === "User account not confirmed") {
            set({ isConfirmed: false });
          }
          toast.error(err.response?.data?.message || "Login failed");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      resendVerification: async (data: ResendVerificationType) => {
        try {
          await API.post("/auth/resend-verification", data);
          toast.success("Verification email resent! Please check your inbox.");
        } catch (err: any) {
          toast.error(
            err.response?.data?.message || "Resend verification failed",
          );
        } finally {
          set({ isConfirmed: undefined });
        }
      },
      logout: async () => {
        try {
          await API.post("/auth/logout");
          set({ user: null });
          useSocket.getState().disconnectSocket();
          toast.success("Logout successful!");
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Logout failed");
        }
      },
      sendForgotPassword: async (data: ForgotPasswordType) => {
        set({ isLoading: true });
        try {
          const res = await API.post("/auth/send-forgot-password", data);
          toast.success(
            res?.data?.message || "Password reset instructions sent!",
          );
        } catch (err: any) {
          toast.error(
            err.response?.data?.message ||
              "Password reset email could not be sent",
          );
        } finally {
          set({ isLoading: true });
        }
      },
      updatePassword: async (
        data: UpdatePasswordType,
        token: string | null,
      ) => {
        set({ isLoading: true });
        try {
          const res = await API.post(
            `/auth/update-forgotten-password/${token}`,
            data,
          );
          toast.success(res?.data?.message || "Password reset successfully!");
          return true;
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Password reset failed");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      changePassword: async (data: ChangePasswordType) => {
        set({ isLoading: true });
        try {
          await API.put("/auth/change-password", data);
          toast.success("Password updated successfully!");
          return true;
        } catch (err: any) {
          toast.error(
            err.response?.data?.message || "Changing the password failed",
          );
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      setPassword: async (data: SetPasswordType) => {
        set({ isLoading: true });
        try {
          const res = await API.post("/auth/set-password", data);
          toast.success("Password set successfully!");
          set({ user: res.data.user });
          return true;
        } catch (err: any) {
          toast.error(
            err.response?.data?.message || "Setting the password failed",
          );
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      enable2fa: async () => {
        try {
          const res = await API.post("/auth/enable2fa");
          set({ qrCode: res.data.qrCode });
          toast.info("2FA enabled! Please verify to complete the process.");
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Enabling 2FA failed");
        }
      },
      verify2fa: async (data: Verify2FAType) => {
        set({ isLoading: true });
        try {
          const res = await API.post("/auth/verify2fa", data);
          toast.success("2FA verified successfully.");

          const userId = useAuth.getState().user?._id;
          if (!isUserOnline(userId)) useSocket.getState().connectSocket();

          set({ user: res.data.user, qrCode: null });
          return true;
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Verifying 2FA failed");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      disable2fa: async () => {
        try {
          await API.put("/auth/disable2fa");
          toast.success("2FA disabled successfully.");

          const user = useAuth.getState().user;
          if (user) {
            set({ user: { ...user, enabled2fa: false } });
          }
          return true;
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Disabling 2FA failed");
          return false;
        }
      },
      isAuthStatus: async () => {
        set({ isLoading: true });

        try {
          const res = await API.get("/auth/status");
          set({ user: res.data.user });
          useSocket.getState().connectSocket();
        } catch (err: any) {
          if (
            useAuth.getState().user &&
            !accessTokenExpiredError(err, useAuth.getState().user)
          ) {
            toast.error(err.response?.data?.message || "Authentication failed");
          }
          set({ user: null });
          useSocket.getState().disconnectSocket();
        } finally {
          set({ isLoading: false });
        }
      },
      updateAccount: async (data: UpdateUserType) => {
        set({ isLoading: true });
        try {
          const res = await API.put("/users/update", data);
          set({ user: res.data.user });
          toast.success("Account updated successfully!");
          return true;
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Account update failed");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      deleteAccount: async () => {
        set({ isLoading: true });
        try {
          const res = await API.delete("/users/delete");
          set({ user: null });
          useSocket.getState().disconnectSocket();
          toast.success(res.data?.message || "Account deleted successfully!");
          return true;
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Account deletion failed");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      setFavoriteChats: (favorites) => {
        set((state) => {
          if (!state.user) return state;
          return {
            ...state,
            user: {
              ...state.user,
              favorites: [...favorites],
            },
          };
        });
      },
      checkChatDeletion: (chatId) => {
        set((state) => {
          if (!state.user) return state;
          return {
            ...state,
            user: {
              ...state.user,
              favorites:
                state.user.favorites?.filter((f) => f._id !== chatId) ?? [],
            },
          };
        });
      },
      blockUser: (userToBeBlockedId) => {
        set((state) => {
          if (!state.user) return state;
          return {
            ...state,
            user: {
              ...state.user,
              blocked: [...(state.user.blocked ?? []), userToBeBlockedId],
            },
          };
        });
      },
      unblockUser: (userToBeBlockedId) => {
        set((state) => {
          if (!state.user) return state;
          return {
            ...state,
            user: {
              ...state.user,
              blocked: [
                ...(state.user.blocked?.filter(
                  (u) => u !== userToBeBlockedId,
                ) ?? []),
              ],
            },
          };
        });
      },
    }),
    {
      name: "whop:root",
    },
  ),
);
