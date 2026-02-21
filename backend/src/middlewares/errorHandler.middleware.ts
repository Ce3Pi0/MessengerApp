import { ErrorRequestHandler } from "express";
import { HTTP_STATUS, HTTP_STATUS_MESSAGE } from "../config/http.config";
import { AppError, ErrorCodes } from "../utils/app-error";

export const errorHandler: ErrorRequestHandler = (err, req, res, next): any => {
  console.error(`Error occurred: ${req.path}`, err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      error: err.errorCode,
    });
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: HTTP_STATUS_MESSAGE[HTTP_STATUS.INTERNAL_SERVER_ERROR],
    error: err?.message || "An unexpected error occurred",
    errorCode: ErrorCodes.ERR_INTERNAL,
  });
};
