import rateLimit from "express-rate-limit";
import { HTTP_STATUS, HTTP_STATUS_MESSAGE } from "./http.config";

const LIMIT_PERIOD: number = 15 * 60 * 1000;
const MAX_REQUESTS: number = 3000;

export const rateLimiter = rateLimit({
  windowMs: LIMIT_PERIOD,
  max: MAX_REQUESTS,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  message: {
    message: HTTP_STATUS_MESSAGE[HTTP_STATUS.TOO_MANY_REQUESTS],
  },
});
