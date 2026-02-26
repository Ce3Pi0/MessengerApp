import { Request, Response, Router } from "express";
import {
  authStatusController,
  changePasswordController,
  googleAuthController,
  linkAccountController,
  loginController,
  logoutController,
  refreshController,
  registerController,
} from "../controllers/auth.controller";
import { blockIfAuthenticated } from "../middlewares/blockIfAuthenticated.middleware";
import { passportAuthenticateJwt } from "../middlewares/authJwt.middleware";
import { passportAuthenticateGoogle } from "../middlewares/authGoogle.middleware";
import passport from "../config/passport.config";
import { blockIfGoogleAccount } from "../middlewares/blockIfGoogleAccount.middleware";
import { blockIfMerged } from "../middlewares/blockIfMerged.middleware";

const authRoutes = Router()
  .get(
    "/google",
    blockIfMerged,
    blockIfGoogleAccount,
    passportAuthenticateGoogle,
  )
  .get(
    "/google/success",
    blockIfMerged,
    blockIfGoogleAccount,
    passport.authenticate("google", { session: false }),
    googleAuthController,
  )
  .post("/register", blockIfAuthenticated, registerController)

  .post("/login", blockIfAuthenticated, loginController)
  .post("/logout", passportAuthenticateJwt, logoutController)
  .put("/change-password", passportAuthenticateJwt, changePasswordController)

  .get(
    "/link-account",
    passportAuthenticateJwt,
    blockIfMerged,
    blockIfGoogleAccount,
    linkAccountController,
  )

  .get("/status", passportAuthenticateJwt, authStatusController)

  .put("/refresh", refreshController);

export default authRoutes;
