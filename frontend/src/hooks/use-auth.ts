import { API } from "@/lib/axios-client";
import type { LoginType, RegisterType, UserType } from "@/types/auth.type";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSocket } from "./use-socket";

const BASE_URL =
  import.meta.env.MODE === "development" ? import.meta.env.VITE_API_URL : "/";

interface AuthState {
  user: UserType | null;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  isAuthStatusLoading: boolean;

  register: (data: RegisterType) => void;
  googleLogin: () => void;
  login: (data: LoginType) => void;
  logout: () => void;
  isAuthStatus: () => void;
}

const handleRefresh = async (set: any) => {
  await API.put("/auth/refresh");
  const res = await API.get("/auth/status");
  set({ user: res.data.user });
  useSocket.getState().connectSocket();
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isSigningUp: false,
      isLoggingIn: false,
      isAuthStatusLoading: false,

      register: async (data: RegisterType) => {
        set({ isSigningUp: true });
        try {
          await API.post("/auth/register", data);
          toast.success("Registration successful! Please log in.");
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Register failed");
        } finally {
          set({ isSigningUp: false });
        }
      },
      googleLogin: () => {
        const backendUrl =
          import.meta.env.MODE === "development"
            ? BASE_URL + "/api/v1/auth/google" // Your actual backend URL
            : "/api/v1/auth/google";

        window.location.href = backendUrl;
      },
      login: async (data: LoginType) => {
        set({ isLoggingIn: true });
        try {
          const res = await API.post("/auth/login", data);
          set({ user: res.data.user });
          useSocket.getState().connectSocket();
          toast.success("Login successful!");
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Login failed");
        } finally {
          set({ isLoggingIn: false });
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
      isAuthStatus: async () => {
        set({ isAuthStatusLoading: true });
        try {
          const res = await API.get("/auth/status");
          set({ user: res.data.user });
          useSocket.getState().connectSocket();
        } catch (err: any) {
          if (
            err.response?.status === 401 &&
            err.response?.data?.message === "Missing token"
          ) {
            handleRefresh(set);
          } else {
            toast.error(err.response?.data?.message || "Authentication failed");
            set({ user: null });
            useSocket.getState().disconnectSocket();
          }
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
