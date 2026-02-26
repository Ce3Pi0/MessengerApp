import { slowDown } from "express-slow-down";

const LIMIT_PERIOD: number = 15 * 60 * 1000;
const MAX_REQUESTS: number = 1000;

export const rateSlowDown = slowDown({
  windowMs: LIMIT_PERIOD,
  delayAfter: MAX_REQUESTS,
  delayMs: (hits) => hits * 100,
});
