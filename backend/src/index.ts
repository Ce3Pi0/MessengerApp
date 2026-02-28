import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import cors from "cors";
import passport from "passport";
import { Env } from "./config/env.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import connectDatabase from "./config/database.config";
import "./config/jwt.strategy.config";
import router from "./routes";
import { rateLimiter } from "./config/rateLimiter.config";
import { rateSlowDown } from "./config/rateSlowDown.config";
import path from "path";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: Env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(passport.initialize());

app.get("/", (_, res) => {
  res.sendFile(path.join(process.cwd(), "docs.json"));
});

app.use("/api", rateLimiter);
app.use("/api", rateSlowDown);
app.use("/api/v1", router);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connectDatabase();
  console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});
