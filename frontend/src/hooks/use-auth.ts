import { API } from "@/lib/axios-client";
import type { LoginType, RegisterType, UserType } from "@/types/auth.type";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSocket } from "./use-socket";
import { accessTokenExpiredError, handleRefresh } from "@/lib/helper";

interface AuthState {
  user: UserType | null;
  isLoggingIn: boolean;
  isConfirmed: boolean | undefined;
  isSigningUp: boolean;
  isAuthStatusLoading: boolean;
  isChanging: boolean;

  register: (data: RegisterType) => Promise<boolean>;
  login: (data: LoginType) => void;
  resendVerification: (data: { email: string }) => void;
  logout: () => void;
  changePassword: (data: {
    newPassword: string;
    confirmNewPassword: string;
  }) => Promise<boolean>;
  isAuthStatus: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isSigningUp: false,
      isLoggingIn: false,
      isAuthStatusLoading: false,
      isConfirmed: undefined,
      isChanging: false,

      register: async (data: RegisterType) => {
        set({ isSigningUp: true });
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
          set({ isSigningUp: false });
        }
      },
      login: async (data: LoginType) => {
        set({ isLoggingIn: true });
        try {
          const res = await API.post("/auth/login", data);
          set({ user: res.data.user });
          useSocket.getState().connectSocket();
          if (useAuth.getState().isConfirmed !== undefined)
            set({ isConfirmed: undefined });
          toast.success("Login successful!");
        } catch (err: any) {
          if (err.response?.data?.message === "User account not confirmed") {
            set({ isConfirmed: false });
          } else set({ isConfirmed: undefined });
          toast.error(err.response?.data?.message || "Login failed");
        } finally {
          set({ isLoggingIn: false });
        }
      },

      resendVerification: async (data: { email: string }) => {
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
      changePassword: async (data: {
        newPassword: string;
        confirmNewPassword: string;
      }) => {
        set({ isChanging: true });
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
          set({ isChanging: false });
        }
      },
      isAuthStatus: async () => {
        set({ isAuthStatusLoading: true });

        try {
          const res = await API.get("/auth/status");
          set({ user: res.data.user });
          useSocket.getState().connectSocket();
        } catch (err: any) {
          if (accessTokenExpiredError(err, useAuth.getState().user)) {
            handleRefresh(set);
          } else if (useAuth.getState().user) {
            toast.error(err.response?.data?.message || "Authentication failed");
          }
          set({ user: null });
          useSocket.getState().disconnectSocket();
        } finally {
          set({ isAuthStatusLoading: false });
        }
      },
    }),
    {
      name: "whop:root",
    },
  ),
);
