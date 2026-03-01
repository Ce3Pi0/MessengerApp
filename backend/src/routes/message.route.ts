import { Router } from "express";
import { passportAuthenticateJwt } from "../middlewares/authJwt.middleware";
import { sendMessageController } from "../controllers/message.controller";

const messageRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/send", sendMessageController);
// .put("/edit", editMessageController)
// .delete("/delete", deleteMessageController)

export default messageRoutes;
