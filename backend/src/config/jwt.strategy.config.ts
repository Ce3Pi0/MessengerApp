import passport from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  VerifiedCallback,
} from "passport-jwt";
import { Algorithm } from "jsonwebtoken";
import { UnauthorizedException } from "../utils/app-error";
import { HTTP_STATUS, HTTP_STATUS_MESSAGE } from "./http.config";
import { Env } from "./env.config";
import { findByIdUserService } from "../services/user.service";

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => {
      const token = req.cookies.accessToken;

      if (!token) throw new UnauthorizedException("Missing token");
      return token;
    },
  ]),
  secretOrKey: Env.JWT_ACCESS_SECRET,
  audience: ["user"],
  algorithms: ["HS256"] as Algorithm[],
};

async function verify(token: any, done: VerifiedCallback) {
  try {
    const user = token.id && (await findByIdUserService(token.id));
    return done(null, user || false);
  } catch (err) {
    return done(null, false);
  }
}

export default new JwtStrategy(options, verify);
