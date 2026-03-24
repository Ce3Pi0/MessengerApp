import { Router } from "express";
import {
  addAdminChatController,
  addUserChatController,
  createChatController,
  deleteChatController,
  getSingleChatController,
  getUserChatsController,
  removeUserFromChatController,
  updateChatController,
} from "../controllers/chat.controller";
import { passportAuthenticateJwt } from "../middlewares/authJwt.middleware";

const chatRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/create", createChatController)
  .get("/all", getUserChatsController)
  .get("/:id", getSingleChatController)
  .put("/update/:id", updateChatController)
  .put("/add-admin/:id", addAdminChatController)
  .delete("/delete/:id", deleteChatController)
  .post("/add-user/", addUserChatController)
  .delete("/remove-user/", removeUserFromChatController);

export default chatRoutes;
