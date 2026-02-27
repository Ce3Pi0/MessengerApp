import { transporter } from "../config/nodemailer.config";
import { InternalServerException } from "./app-error";

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export const sendMail = (mailOptions: MailOptions) => {
  transporter.sendMail(mailOptions, (err, _) => {
    if (err) {
      throw new InternalServerException();
    }
  });
};
