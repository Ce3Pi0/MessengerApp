import { Request, Response, Router } from "express";
import {
  authStatusController,
  googleAuthController,
  loginController,
  logoutController,
  refreshController,
  registerController,
} from "../controllers/auth.controller";
import { blockIfAuthenticated } from "../middlewares/blockIfAuthenticated.middleware";
import { passportAuthenticateJwt } from "../middlewares/authJwt.middleware";
import { passportAuthenticateGoogle } from "../middlewares/authGoogle.middleware";
import passport from "../config/passport.config";

const authRoutes = Router()
  .get("/google", blockIfAuthenticated, passportAuthenticateGoogle)
  .get(
    "/google/success",
    blockIfAuthenticated,
    passport.authenticate("google", { session: false }),
    googleAuthController,
  )
  .post("/register", blockIfAuthenticated, registerController)
  .post("/login", blockIfAuthenticated, loginController)
  .post("/logout", passportAuthenticateJwt, logoutController)
  .get("/status", passportAuthenticateJwt, authStatusController)
  .post("/refresh", refreshController);

export default authRoutes;
