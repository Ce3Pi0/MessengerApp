import passport from "passport";
import googleOauth2StrategyConfig from "./google-oauth2.strategy.config";
import jwtStrategyConfig from "./jwt.strategy.config";

passport.use("google", googleOauth2StrategyConfig);
passport.use("jwt", jwtStrategyConfig);

export default passport;
