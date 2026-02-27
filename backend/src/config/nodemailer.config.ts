import nodemailer from "nodemailer";
import { Env } from "./env.config";

export const transporter = nodemailer.createTransport({
  host: Env.SMTP_HOST,
  port: parseInt(Env.SMTP_PORT),
  secure: false, // FIXME: For production
  auth: {
    user: Env.SENDER_EMAIL,
    pass: Env.SENDER_PASS,
  },
});
