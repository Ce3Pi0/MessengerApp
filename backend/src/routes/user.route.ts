import { Router } from "express";
import {
  addFavoriteUserController,
  blockUserController,
  deleteUserController,
  getAiUserController,
  getSingleUserController,
  getUsersController,
  removeFavoriteUserController,
  unblockUserController,
  updateUserController,
} from "../controllers/user.controller";
import { passportAuthenticateJwt } from "../middlewares/authJwt.middleware";

const userRoutes = Router()
  .use(passportAuthenticateJwt)
  .get("/all", getUsersController)
  .get("/ai", getAiUserController)
  .get("/:id", getSingleUserController)
  .put("/update", updateUserController)
  .put("/add-favorite", addFavoriteUserController)
  .put("/remove-favorite", removeFavoriteUserController)
  .put("/block-user", blockUserController)
  .put("/unblock-user", unblockUserController)
  .delete("/delete", deleteUserController);

export default userRoutes;
