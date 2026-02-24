import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { Env } from "./env.config";
import { googleAuthRegisterService } from "../services/auth.service";

const options = {
  clientID: Env.GOOGLE_CLIENT_ID || "",
  clientSecret: Env.GOOGLE_CLIENT_SECRET || "",
  callbackURL: Env.CALLBACK_URL,
  state: false,
  proxy: true,
};

async function verify(
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: VerifyCallback,
) {
  try {
    console.log("Google Profile:", profile);

    const user = await googleAuthRegisterService(profile);

    return done(null, user);
  } catch (error) {
    return done(error as Error);
  }
}

export default new GoogleStrategy(options, verify);
