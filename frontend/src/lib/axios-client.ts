import axios from "axios";

export const API = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:8000/api/v1"
      : import.meta.env.VITE_API_URL + "api/v1",
  withCredentials: true,
});
