import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiErrorException extends HttpException {
  constructor(
    message: string,
    errorCode: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    data?: any
  ) {
    const response = {
      statusCode,
      message,
      error: errorCode,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
    };

    super(response, statusCode);
  }
}

export enum ErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_USER_ID = 'INVALID_USER_ID',

  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  INVALID_EMAIL = 'INVALID_EMAIL',
  EMAIL_REQUIRED = 'EMAIL_REQUIRED',

  INVALID_PASSWORD = 'INVALID_PASSWORD',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',

  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
