import { API } from "@/lib/axios-client";
import type {
  ChangePasswordType,
  LoginType,
  RegisterType,
  ResendVerificationType,
  UserType,
  Verify2FAType,
} from "@/types/auth.type";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSocket } from "./use-socket";
import {
  accessTokenExpiredError,
  handleRefresh,
  isUserOnline,
} from "@/lib/helper";

interface AuthState {
  user: UserType | null;
  isLoggingIn: boolean;
  waitingMfa: boolean;
  isConfirmed: boolean | undefined;
  isSigningUp: boolean;
  isAuthStatusLoading: boolean;
  isChanging: boolean;
  mfaStatusChanging: boolean;
  mfaVerifying: boolean;
  qrCode: string | null;

  register: (data: RegisterType) => Promise<boolean>;
  login: (data: LoginType) => Promise<boolean>;
  resendVerification: (data: ResendVerificationType) => void;
  logout: () => void;
  changePassword: (data: ChangePasswordType) => Promise<boolean>;
  enable2fa: () => Promise<boolean>;
  verify2fa: (data: Verify2FAType) => Promise<boolean>;
  disable2fa: () => Promise<boolean>;
  isAuthStatus: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isSigningUp: false,
      isLoggingIn: false,
      waitingMfa: false,
      isAuthStatusLoading: false,
      isConfirmed: undefined,
      isChanging: false,
      mfaStatusChanging: false,
      mfaVerifying: false,
      qrCode: null,

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
        set({ isLoggingIn: true, waitingMfa: false });
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
          } else set({ isConfirmed: undefined });
          toast.error(err.response?.data?.message || "Login failed");
          return false;
        } finally {
          set({ isLoggingIn: false });
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
      changePassword: async (data: ChangePasswordType) => {
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
      enable2fa: async () => {
        set({ mfaStatusChanging: true });
        try {
          const res = await API.post("/auth/enable2fa");
          set({ qrCode: res.data.qrCode });
          toast.success("2FA enabled! Please verify to complete the process.");
          return true;
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Enabling 2FA failed");
          return false;
        } finally {
          set({ mfaStatusChanging: false });
        }
      },
      verify2fa: async (data: Verify2FAType) => {
        set({ mfaVerifying: true });
        try {
          const res = await API.post("/auth/verify2fa", data);
          toast.success("2FA verified successfully.");

          const userId = useAuth.getState().user?._id;
          if (isUserOnline(userId)) useSocket.getState().connectSocket();
          set({ user: res.data.user, qrCode: null, waitingMfa: false });
          return true;
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Verifying 2FA failed");
          return false;
        } finally {
          set({ mfaVerifying: false });
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
