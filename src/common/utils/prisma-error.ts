import { HttpStatus, Logger } from '@nestjs/common';
import {
  ApiErrorException,
  ErrorCode,
} from '../exceptions/api-error.exception.js';

type PrismaErrorOptions = {
  conflictCode?: ErrorCode;
  conflictMessage?: string;
  notFoundCode?: ErrorCode;
  notFoundMessage?: string;
  defaultMessage: string;
  badRequestCode?: ErrorCode;
  badRequestMessage?: string;
  logger?: Logger;
};

export const handlePrismaError = (
  error: unknown,
  {
    conflictCode,
    conflictMessage,
    notFoundCode,
    notFoundMessage,
    defaultMessage,
    badRequestCode,
    badRequestMessage,
    logger = new Logger('PrismaError'),
  }: PrismaErrorOptions,
): never => {
  const err = error as any;

  if (err?.code === 'P2002' && conflictCode) {
    logger.warn(conflictMessage ?? 'Duplicate resource');
    throw new ApiErrorException(
      conflictMessage ?? 'Duplicate resource',
      conflictCode,
      HttpStatus.CONFLICT,
    );
  }

  if (err?.code === 'P2003' && badRequestCode) {
    logger.warn(badRequestMessage ?? 'Related record not found');
    throw new ApiErrorException(
      badRequestMessage ?? 'Related record not found',
      badRequestCode,
      HttpStatus.BAD_REQUEST,
    );
  }

  if (err?.code === 'P2025' && notFoundCode) {
    logger.warn(notFoundMessage ?? 'Record not found');
    throw new ApiErrorException(
      notFoundMessage ?? 'Record not found',
      notFoundCode,
      HttpStatus.NOT_FOUND,
    );
  }

  const errMessage = error instanceof Error ? error.message : 'Unknown error';
  const errStack = error instanceof Error ? error.stack : undefined;

  logger.error(`Unexpected Prisma error: ${errMessage}`, errStack);

  throw new ApiErrorException(
    defaultMessage,
    ErrorCode.DATABASE_ERROR,
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
};
