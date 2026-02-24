import { Router } from "express";
import {
  authStatusController,
  loginController,
  logoutController,
  refreshController,
  registerController,
} from "../controllers/auth.controller";
import { passportAuthenticateJwt } from "../config/jwt-passport.config";
import { blockIfAuthenticated } from "../middlewares/blockIfAuthenticated.middleware";

const authRoutes = Router()
  .post("/register", blockIfAuthenticated, registerController)
  .post("/login", blockIfAuthenticated, loginController)
  .post("/logout", passportAuthenticateJwt, logoutController)
  .get("/status", passportAuthenticateJwt, authStatusController)
  .post("/refresh", refreshController);

export default authRoutes;
