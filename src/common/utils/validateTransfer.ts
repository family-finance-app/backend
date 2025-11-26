import { CreateTransferDataDto } from '../../modules/transactions/dto/transfer.dto.js';
import { Logger, BadRequestException } from '@nestjs/common';

export const validateTransfer = (
  transferData: CreateTransferDataDto,
  userId: number
) => {
  const logger = Logger;
  if (!transferData) {
    logger.warn('Invalid transferData provided');
    throw new BadRequestException('Transfer data is required');
  }

  if (!userId || isNaN(userId)) {
    logger.warn('Invalid userId provided');
    throw new BadRequestException('Invalid userId');
  }

  if (!transferData.accountId || !transferData.accountRecipientId) {
    logger.warn('Source or destination account not provided');
    throw new BadRequestException(
      'Both source and destination accounts are required'
    );
  }

  if (transferData.accountId === transferData.accountRecipientId) {
    logger.warn('Sender and recipient account are the same');
    throw new BadRequestException('Cannot transfer to the same account');
  }

  if (!transferData.amount || transferData.amount <= 0) {
    logger.warn('Invalid transfer amount');
    throw new BadRequestException('Amount must be greater than 0');
  }
};
