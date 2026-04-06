import { useAuth } from "@/hooks/use-auth";
import axios from "axios";
import { accessTokenExpiredError, handleRefresh } from "./helper";
import { useChat } from "@/hooks/use-chat";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "api/v1",
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  async (err) => {
    const originalRequest = err.config;

    if (
      accessTokenExpiredError(err, useAuth.getState().user) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const success = await handleRefresh(
          useAuth.getState().setUser,
          useChat.getState().setChats,
        );

        if (success) {
          return API(originalRequest);
        }
      } catch (refreshError) {
        useAuth.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  },
);
