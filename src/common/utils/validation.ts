import { Logger, HttpStatus } from '@nestjs/common';
import {
  ApiErrorException,
  ErrorCode,
} from '../exceptions/api-error.exception.js';

export const validateRequiredString = (
  value: string | undefined | null,
  fieldName: string,
  errorCode: ErrorCode,
  logger: Logger = new Logger('ValidationUtils'),
) => {
  const sanitizedString = value?.trim();

  if (!sanitizedString) {
    logger.warn(`${fieldName} is missing`);
    throw new ApiErrorException(
      `${fieldName} is required`,
      errorCode,
      HttpStatus.BAD_REQUEST,
    );
  }

  return sanitizedString;
};

export const validateRequiredId = (
  value: number | undefined | null,
  fieldName: string,
  errorCode: ErrorCode,
  logger: Logger = new Logger('ValidationUtils'),
) => {
  if (!Number.isFinite(value) || Number(value) <= 0) {
    logger.warn(`Invalid ${fieldName}`);
    throw new ApiErrorException(
      `Invalid ${fieldName}`,
      errorCode,
      HttpStatus.BAD_REQUEST,
    );
  }

  return Number(value);
};
