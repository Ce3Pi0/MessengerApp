import { Router } from "express";
import {
  getSingleUserController,
  getUsersController,
  updateUserController,
} from "../controllers/user.controller";
import { passportAuthenticateJwt } from "../middlewares/authJwt.middleware";

const userRoutes = Router()
  .use(passportAuthenticateJwt)
  .get("/all", getUsersController)
  .get("/:id", getSingleUserController)
  .put("/update", updateUserController);

export default userRoutes;
