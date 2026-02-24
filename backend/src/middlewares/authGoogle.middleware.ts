import passport from "../config/passport.config";

export const passportAuthenticateGoogle = passport.authenticate("google", {
  scope: ["email", "profile"],
});
