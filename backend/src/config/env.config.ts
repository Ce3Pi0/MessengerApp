import { getEnv } from "../utils/get-env";

export const Env = {
  SALT: getEnv("SALT", "default_salt_value"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "8000"),
  API_URL: getEnv("API_URL", "http://localhost:8000/api"),
  MONGO_URI: getEnv("MONGO_URI"),
  SMTP_HOST: getEnv("SMTP_HOST", "smtp.gmail.com"),
  SMTP_PORT: getEnv("SMTP_PORT", "587"),
  SENDER_EMAIL: getEnv("SENDER_EMAIL"),
  SENDER_PASS: getEnv("SENDER_PASS"),
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_URL: getEnv("GOOGLE_URL", "http://localhost:8000/api/auth/google"),
  CALLBACK_URL: getEnv(
    "CALLBACK_URL",
    "http://localhost:8000/api/auth/google/success",
  ),
  JWT_VERIFY_SECRET: getEnv("JWT_VERIFY_SECRET"),
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "1d"),
  FRONTEND_URL: getEnv("FRONTEND_URL", "http://localhost:5173/"),
} as const;
