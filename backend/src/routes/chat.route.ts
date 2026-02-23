import { Router } from "express";
import {
  createChatController,
  getSingleChatController,
  getUserChatsController,
} from "../controllers/chat.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const chatRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/create", createChatController)
  .get("/all", getUserChatsController)
  .get("/:id", getSingleChatController);

export default chatRoutes;
