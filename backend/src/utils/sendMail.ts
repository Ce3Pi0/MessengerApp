import axios from "axios";
import { Env } from "../config/env.config";
import { InternalServerException } from "./app-error";

interface MailOptions {
  to: string;
  subject: string;
  text: string;
}

export const sendMail = async (mailOptions: MailOptions) => {
  const url = "https://api.brevo.com/v3/smtp/email";

  const data = {
    sender: { name: "Messenger Application", email: Env.SENDER_EMAIL },
    to: [{ email: mailOptions.to }],
    subject: mailOptions.subject,
    textContent: mailOptions.text,
  };

  try {
    await axios.post(url, data, {
      headers: {
        "api-key": Env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    });
    console.log("Email sent successfully via REST API");
  } catch (error: any) {
    console.error("Brevo API Error:", error.response?.data || error.message);
    throw new InternalServerException("Failed to send email");
  }
};
