import { Router } from "express";
import { passportAuthenticateJwt } from "../middlewares/authJwt.middleware";
import {
  sendMessageController,
  editMessageController,
  deleteMessageController,
  readMessageController,
} from "../controllers/message.controller";

const messageRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/send", sendMessageController)
  .put("/edit", editMessageController)
  .put("/read", readMessageController)
  .delete("/delete", deleteMessageController);

export default messageRoutes;
