import { Router, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTP_STATUS } from "../config/http.config";

const serverStatusRoutes = Router().get(
  "/status",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      message: "Server is running",
      status: "OK",
    });
  }),
);

export default serverStatusRoutes;
