import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import passport from "passport";
import { Env } from "./config/env.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import connectDatabase from "./config/database.config";
import "./config/jwt.strategy.config";
import router from "./routes";
import { rateLimiter } from "./config/rateLimiter.config";
import { rateSlowDown } from "./config/rateSlowDown.config";
import { initializeSocket } from "./lib/socket";

const app = express();
const server = http.createServer(app);

initializeSocket(server);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: Env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(passport.initialize());

app.get("/docs", (_, res) => {
  res.sendFile(path.join(process.cwd(), "docs.json"));
});

app.use("/api", rateLimiter);
app.use("/api", rateSlowDown);
app.use("/api/v1", router);

if (Env.NODE_ENV === "production") {
  const clientPath = path.resolve(__dirname, "../../frontend/dist");

  //Serve static files
  app.use(express.static(clientPath));
  app.get(/^(?!\/api).*/, (req: Request, res: Response) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

app.use(errorHandler);

server.listen(Env.PORT, async () => {
  await connectDatabase();
  console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});
