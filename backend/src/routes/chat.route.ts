import { Router } from "express";
import {
  createChatController,
  deleteChatController,
  getSingleChatController,
  getUserChatsController,
  removeUserFromChatController,
} from "../controllers/chat.controller";
import { passportAuthenticateJwt } from "../middlewares/authJwt.middleware";

const chatRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/create", createChatController)
  .get("/all", getUserChatsController)
  .get("/:id", getSingleChatController)
  .delete("/delete/:id", deleteChatController)
  .delete("/remove-user/", removeUserFromChatController);

export default chatRoutes;
