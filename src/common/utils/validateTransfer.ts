import { CreateTransferDataDto } from '../../modules/transactions/dto/transfer.dto.js';
import { Logger, HttpStatus } from '@nestjs/common';
import {
  ApiErrorException,
  ErrorCode,
} from '../exceptions/api-error.exception.js';

export const validateTransfer = (
  transferData: CreateTransferDataDto,
  userId: number,
) => {
  const logger = new Logger('ValidateTransfer');
  if (!transferData) {
    logger.warn('Invalid transferData provided');
    throw new ApiErrorException(
      'Transfer data is required',
      ErrorCode.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  }

  if (!userId || isNaN(userId)) {
    logger.warn('Invalid userId provided');
    throw new ApiErrorException(
      'Invalid userId',
      ErrorCode.INVALID_USER_ID,
      HttpStatus.BAD_REQUEST,
    );
  }

  if (!transferData.accountId || !transferData.accountRecipientId) {
    logger.warn('Source or destination account not provided');
    throw new ApiErrorException(
      'Both source and destination accounts are required',
      ErrorCode.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  }

  if (transferData.accountId === transferData.accountRecipientId) {
    logger.warn('Sender and recipient account are the same');
    throw new ApiErrorException(
      'Cannot transfer to the same account',
      ErrorCode.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  }

  if (!transferData.amount || transferData.amount <= 0) {
    logger.warn('Invalid transfer amount');
    throw new ApiErrorException(
      'Amount must be greater than 0',
      ErrorCode.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  }
};
