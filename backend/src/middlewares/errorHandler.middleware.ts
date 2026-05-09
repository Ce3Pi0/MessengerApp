import { ErrorRequestHandler } from "express";
import { HTTP_STATUS, HTTP_STATUS_MESSAGE } from "../config/http.config";
import {
  AppError,
  ErrorCodes,
  ForbiddenException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "../utils/app-error";
import { ZodError, ZodIssue } from "zod";
import { JsonWebTokenError } from "jsonwebtoken";

const formatZodErrMsg = (
  zodIssue: ZodIssue,
  prevErrMsg: string = "",
): string => {
  if (prevErrMsg) prevErrMsg += " | ";

  prevErrMsg = zodIssue.message;
  prevErrMsg += zodIssue.code === "invalid_type" ? `: ${zodIssue.path} ` : " ";

  return prevErrMsg;
};

const zodErrorHandler = (zodErr: ZodError): AppError => {
  const zodErrors: ZodIssue[] = zodErr.errors;
  let errMsg = formatZodErrMsg(zodErrors[0]);
  zodErrors.shift();

  for (let zodErr of zodErrors) {
    errMsg += formatZodErrMsg(zodErr, errMsg);
  }

  return new UnprocessableEntityException(errMsg);
};

const jwtErrorHandler = (err: any): AppError => {
  if (err.name === "TokenExpiredError") {
    return new ForbiddenException("Token expired");
  }
  return new UnauthorizedException("Invalid token");
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next): any => {
  console.error(`Error occurred: ${req.path}`, err);

  if (err instanceof ZodError) {
    err = zodErrorHandler(err);
  }

  if (err instanceof JsonWebTokenError) {
    err = jwtErrorHandler(err);
  }

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
