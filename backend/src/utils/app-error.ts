import { HTTP_STATUS, HttpStatusCodeType } from "../config/http.config";

export const ErrorCodes = {
  ERR_INTERNAL: "ERR_INTERNAL",
  ERR_BAD_REQUEST: "ERR_BAD_REQUEST",
  ERR_UNAUTHORIZED: "ERR_UNAUTHORIZED",
  ERR_FORBIDDEN: "ERR_FORBIDDEN",
  ERR_NOT_FOUND: "ERR_NOT_FOUND",
  ERR_CONFLICT: "ERR_CONFLICT",
} as const;
export type ErrorCodeType = keyof typeof ErrorCodes;
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: HttpStatusCodeType = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public errorCode: ErrorCodeType = ErrorCodes.ERR_INTERNAL,
  ) {
    super(message);
    Error.captureStackTrace(this);
  }
}

export class InternalServerException extends AppError {
  constructor(message: string = "Internal Server Error") {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ErrorCodes.ERR_INTERNAL);
  }
}

export class BadRequestException extends AppError {
  constructor(message: string = "Bad Request") {
    super(message, HTTP_STATUS.BAD_REQUEST, ErrorCodes.ERR_BAD_REQUEST);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, HTTP_STATUS.UNAUTHORIZED, ErrorCodes.ERR_UNAUTHORIZED);
  }
}

export class ForbiddenException extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, HTTP_STATUS.FORBIDDEN, ErrorCodes.ERR_FORBIDDEN);
  }
}

export class NotFoundException extends AppError {
  constructor(message: string = "Not Found") {
    super(message, HTTP_STATUS.NOT_FOUND, ErrorCodes.ERR_NOT_FOUND);
  }
}

export class ConflictException extends AppError {
  constructor(message: string = "Conflict") {
    super(message, HTTP_STATUS.CONFLICT, ErrorCodes.ERR_CONFLICT);
  }
}
