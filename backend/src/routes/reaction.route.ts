import { Router } from "express";
import { passportAuthenticateJwt } from "../middlewares/authJwt.middleware";
import {
  deleteReactionController,
  sendReactionController,
} from "../controllers/reaction.controller";

const reactionRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/send", sendReactionController)
  .delete("/delete", deleteReactionController);

export default reactionRoutes;
