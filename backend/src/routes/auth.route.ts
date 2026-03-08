import { Router } from "express";
import {
  authStatusController,
  changePasswordController,
  disable2faController,
  enable2faController,
  forgotPasswordController,
  googleAuthController,
  linkAccountController,
  loginController,
  logoutController,
  refreshController,
  registerController,
  resendVerifyController,
  sendForgotPasswordController,
  setPasswordController,
  updatePasswordController,
  verify2faController,
  verifyController,
} from "../controllers/auth.controller";
import { blockIfAuthenticated } from "../middlewares/blockIfAuthenticated.middleware";
import { passportAuthenticateJwt } from "../middlewares/authJwt.middleware";
import { passportAuthenticateGoogle } from "../middlewares/authGoogle.middleware";
import passport from "../config/passport.config";
import { blockIfGoogleAccount } from "../middlewares/blockIfGoogleAccount.middleware";
import { blockIfMerged } from "../middlewares/blockIfMerged.middleware";
import { restrictToMfaPending } from "../middlewares/restrictToMfaPending.middleware";

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

  .get("/verify/:token", verifyController)
  .post("/resend-verification", resendVerifyController)

  .put("/change-password", passportAuthenticateJwt, changePasswordController)

  .post("/send-forgot-password", sendForgotPasswordController)
  .get("/forgot-password/:token", forgotPasswordController)
  .post("/update-forgotten-password/:token", updatePasswordController)
  .get(
    "/link-account",
    passportAuthenticateJwt,
    blockIfMerged,
    blockIfGoogleAccount,
    linkAccountController,
  )
  .post("/set-password", passportAuthenticateJwt, setPasswordController)
  .post("/enable2fa", passportAuthenticateJwt, enable2faController)
  .post("/verify2fa", restrictToMfaPending, verify2faController)

  .put("/disable2fa", passportAuthenticateJwt, disable2faController)

  .get("/status", passportAuthenticateJwt, authStatusController)

  .put("/refresh", refreshController);

export default authRoutes;
