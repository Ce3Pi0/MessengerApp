import {
  HTTP_STATUS,
  HTTP_STATUS_MESSAGE,
  HttpStatusCodeType,
} from "../config/http.config";

export const ErrorCodes = {
  ERR_INTERNAL: "ERR_INTERNAL",
  ERR_BAD_REQUEST: "ERR_BAD_REQUEST",
  ERR_UNAUTHORIZED: "ERR_UNAUTHORIZED",
  ERR_FORBIDDEN: "ERR_FORBIDDEN",
  ERR_NOT_FOUND: "ERR_NOT_FOUND",
  ERR_CONFLICT: "ERR_CONFLICT",
  ERR_UNPROCESSABLE_ENTITY: "ERR_UNPROCESSABLE_ENTITY",
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
  constructor(
    message: string = HTTP_STATUS_MESSAGE[HTTP_STATUS.INTERNAL_SERVER_ERROR],
  ) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ErrorCodes.ERR_INTERNAL);
  }
}

export class BadRequestException extends AppError {
  constructor(message: string = HTTP_STATUS_MESSAGE[HTTP_STATUS.BAD_REQUEST]) {
    super(message, HTTP_STATUS.BAD_REQUEST, ErrorCodes.ERR_BAD_REQUEST);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message: string = HTTP_STATUS_MESSAGE[HTTP_STATUS.UNAUTHORIZED]) {
    super(message, HTTP_STATUS.UNAUTHORIZED, ErrorCodes.ERR_UNAUTHORIZED);
  }
}

export class ForbiddenException extends AppError {
  constructor(message: string = HTTP_STATUS_MESSAGE[HTTP_STATUS.FORBIDDEN]) {
    super(message, HTTP_STATUS.FORBIDDEN, ErrorCodes.ERR_FORBIDDEN);
  }
}

export class NotFoundException extends AppError {
  constructor(message: string = HTTP_STATUS_MESSAGE[HTTP_STATUS.NOT_FOUND]) {
    super(message, HTTP_STATUS.NOT_FOUND, ErrorCodes.ERR_NOT_FOUND);
  }
}

export class ConflictException extends AppError {
  constructor(message: string = HTTP_STATUS_MESSAGE[HTTP_STATUS.CONFLICT]) {
    super(message, HTTP_STATUS.CONFLICT, ErrorCodes.ERR_CONFLICT);
  }
}

export class UnprocessableEntityException extends AppError {
  constructor(
    message: string = HTTP_STATUS_MESSAGE[HTTP_STATUS.UNPROCESSABLE_ENTITY],
  ) {
    super(
      message,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ErrorCodes.ERR_UNPROCESSABLE_ENTITY,
    );
  }
}
