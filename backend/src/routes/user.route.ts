import { Router } from "express";
import {
  deleteUserController,
  getSingleUserController,
  getUsersController,
  updateUserController,
} from "../controllers/user.controller";
import { passportAuthenticateJwt } from "../middlewares/authJwt.middleware";

const userRoutes = Router()
  .use(passportAuthenticateJwt)
  .get("/all", getUsersController)
  .get("/:id", getSingleUserController)
  .put("/update", updateUserController)
  .delete("/delete", deleteUserController);

export default userRoutes;
