import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { UnauthorizedException } from "../utils/app-error";
import { HTTP_STATUS, HTTP_STATUS_MESSAGE } from "./http.config";
import { Env } from "./env.config";
import { findByIdUserService } from "../services/user.service";

export default new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromExtractors([
      (req) => {
        const token = req.cookies.accessToken;
        if (!token)
          throw new UnauthorizedException(
            HTTP_STATUS_MESSAGE[HTTP_STATUS.UNAUTHORIZED],
          );
        return token;
      },
    ]),
    secretOrKey: Env.JWT_ACCESS_SECRET,
    audience: ["user"],
    algorithms: ["HS256"],
  },
  async ({ id }, done) => {
    try {
      const user = id && (await findByIdUserService(id));
      return done(null, user || false);
    } catch (err) {
      return done(null, false);
    }
  },
);
