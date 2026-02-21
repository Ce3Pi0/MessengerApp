import cookieParser from "cookie-parser";
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { Env } from "./config/env.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { HTTP_STATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import connectDatabase from "./config/database.config";

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

app.get(
  "/status",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      message: "Server is running",
      status: "OK",
    });
  }),
);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connectDatabase();
  console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});
