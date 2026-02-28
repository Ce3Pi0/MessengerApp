import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { Env } from "./env.config";
import { googleAuthService } from "../services/auth.service";

const options = {
  clientID: Env.GOOGLE_CLIENT_ID || "",
  clientSecret: Env.GOOGLE_CLIENT_SECRET || "",
  callbackURL: `${Env.API_URL}${Env.API_VERSION}${Env.CALLBACK_URL}`,
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
    const user = profile && (await googleAuthService(profile));
    return done(null, user || false);
  } catch (err) {
    return done(null, false);
  }
}

export default new GoogleStrategy(options, verify);
