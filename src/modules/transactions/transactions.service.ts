import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { CurrencyType, TransactionType } from '@prisma/client';
import { DatabaseService } from '../../database/database.service.js';
import { CreateTransactionDto } from './dto/create-tr.dto.js';
import { UpdateTransactionDto } from './dto/update-tr.dto.js';
import { CreateTransferDataDto } from './dto/transfer.dto.js';
import { validateTransfer } from '../../common/utils/validateTransfer.js';
import { ExchangeRateService } from '../currency/exchange-rate.service.js';
import { validateRequiredId } from '../../common/utils/validation.js';
import {
  ApiErrorException,
  ErrorCode,
} from '../../common/exceptions/api-error.exception.js';
import { buildSuccessResponse } from '../../common/utils/response.js';
import { handlePrismaError } from '../../common/utils/prisma-error.js';

type InternalCreateTransaction = CreateTransactionDto & {
  userId: number;
  date?: string;
};

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  constructor(
    private database: DatabaseService,
    private exchangeRateService: ExchangeRateService,
  ) {}

  async createTransaction(transactionData: InternalCreateTransaction) {
    const validUserId = validateRequiredId(
      transactionData.userId,
      'user ID',
      ErrorCode.INVALID_USER_ID,
    );

    try {
      const created = await this.database.$transaction(async (tx) => {
        const tr = await tx.transaction.create({
          data: {
            amount: transactionData.amount,
            description: transactionData.description ?? undefined,
            currency: transactionData.currency,
            account: { connect: { id: transactionData.accountId } },
            user: { connect: { id: validUserId } },
            group: transactionData.groupId
              ? { connect: { id: transactionData.groupId } }
              : undefined,
            category: { connect: { id: transactionData.categoryId } },
            type: transactionData.type,
            date: transactionData.date ?? new Date().toISOString(),
          },
          select: {
            id: true,
            accountId: true,
            userId: true,
            categoryId: true,
            amount: true,
            currency: true,
            description: true,
            date: true,
            type: true,
            createdAt: true,
          },
        });

        if (transactionData.type === TransactionType.INCOME) {
          await tx.account.update({
            where: { id: transactionData.accountId },
            data: { balance: { increment: transactionData.amount } },
          });
        } else if (transactionData.type === TransactionType.EXPENSE) {
          await tx.account.update({
            where: { id: transactionData.accountId },
            data: { balance: { decrement: transactionData.amount } },
          });
        }

        return tr;
      });

      return buildSuccessResponse(
        created,
        'Transaction has been successfully created',
        HttpStatus.CREATED,
        '/transactions/create',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;

      handlePrismaError(error, {
        badRequestCode: ErrorCode.VALIDATION_ERROR,
        badRequestMessage: 'Invalid related record',
        notFoundCode: ErrorCode.ACCOUNT_NOT_FOUND,
        notFoundMessage: 'Related record not found',
        defaultMessage: 'Failed to create new transaction',
      });
    }
  }

  async updateTransaction(
    userId: number,
    transactionData: UpdateTransactionDto,
  ) {
    try {
      const validUserId = validateRequiredId(
        userId,
        'user ID',
        ErrorCode.INVALID_USER_ID,
      );

      const validTransactionId = validateRequiredId(
        transactionData.id,
        'transaction ID',
        ErrorCode.VALIDATION_ERROR,
      );

      const existingTransaction = await this.database.transaction.findUnique({
        where: {
          id: validTransactionId,
        },
      });

      if (!existingTransaction) {
        throw new ApiErrorException(
          'Transaction not found',
          ErrorCode.TRANSACTION_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (existingTransaction.userId !== validUserId) {
        throw new ApiErrorException(
          'You do not have an access to this record',
          ErrorCode.UNAUTHORIZED,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const updated = await this.database.$transaction(async (tx) => {
        if (existingTransaction.type === TransactionType.INCOME) {
          await tx.account.update({
            where: { id: existingTransaction.accountId },
            data: { balance: { decrement: existingTransaction.amount } },
          });
        } else if (existingTransaction.type === TransactionType.EXPENSE) {
          await tx.account.update({
            where: { id: existingTransaction.accountId },
            data: { balance: { increment: existingTransaction.amount } },
          });
        }

        const tr = await tx.transaction.update({
          where: { id: validTransactionId },
          data: {
            amount: transactionData.amount,
            description: transactionData.description ?? undefined,
            category: { connect: { id: transactionData.categoryId } },
            date: transactionData.date ?? existingTransaction.date,
          },
          select: {
            id: true,
            accountId: true,
            userId: true,
            categoryId: true,
            amount: true,
            currency: true,
            description: true,
            date: true,
            type: true,
            updatedAt: true,
          },
        });

        if (existingTransaction.type === TransactionType.INCOME) {
          await tx.account.update({
            where: { id: existingTransaction.accountId },
            data: { balance: { increment: transactionData.amount } },
          });
        } else if (existingTransaction.type === TransactionType.EXPENSE) {
          await tx.account.update({
            where: { id: existingTransaction.accountId },
            data: { balance: { decrement: transactionData.amount } },
          });
        }

        return tr;
      });

      return buildSuccessResponse(
        updated,
        'Transaction has been successfully updated',
        HttpStatus.OK,
        '/transactions/update',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;

      handlePrismaError(error, {
        badRequestCode: ErrorCode.VALIDATION_ERROR,
        badRequestMessage: 'Invalid related record',
        notFoundCode: ErrorCode.TRANSACTION_NOT_FOUND,
        notFoundMessage: 'Transaction not found',
        defaultMessage: 'Failed to update transaction',
      });
    }
  }

  async deleteTransaction(userId: number, transactionId: number) {
    try {
      const validUserId = validateRequiredId(
        userId,
        'user ID',
        ErrorCode.INVALID_USER_ID,
      );

      const validTransactionId = validateRequiredId(
        transactionId,
        'transaction ID',
        ErrorCode.VALIDATION_ERROR,
      );

      const existingTransaction = await this.database.transaction.findUnique({
        where: {
          id: validTransactionId,
        },
      });

      if (!existingTransaction) {
        throw new ApiErrorException(
          'Transaction not found',
          ErrorCode.TRANSACTION_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (existingTransaction.userId !== validUserId) {
        throw new ApiErrorException(
          'You do not have an access to this record',
          ErrorCode.UNAUTHORIZED,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const deleted = await this.database.$transaction(async (tx) => {
        if (existingTransaction.type === TransactionType.INCOME) {
          await tx.account.update({
            where: { id: existingTransaction.accountId },
            data: { balance: { decrement: existingTransaction.amount } },
          });
        } else if (existingTransaction.type === TransactionType.EXPENSE) {
          await tx.account.update({
            where: { id: existingTransaction.accountId },
            data: { balance: { increment: existingTransaction.amount } },
          });
        }

        await tx.transaction.delete({
          where: { id: validTransactionId },
        });

        return validTransactionId;
      });

      return buildSuccessResponse(
        deleted,
        'Transaction has been successfully deleted',
        HttpStatus.OK,
        `/transactions/delete/${transactionId}`,
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;

      handlePrismaError(error, {
        badRequestCode: ErrorCode.VALIDATION_ERROR,
        badRequestMessage: 'Invalid related record',
        notFoundCode: ErrorCode.TRANSACTION_NOT_FOUND,
        notFoundMessage: 'Transaction not found',
        defaultMessage: 'Failed to delete transaction',
      });
    }
  }

  async getAllTransactionsByUserId(userId: number) {
    const validUserId = validateRequiredId(
      userId,
      'user ID',
      ErrorCode.INVALID_USER_ID,
    );

    try {
      const userTransactions = await this.database.transaction.findMany({
        where: {
          userId: validUserId,
        },
        select: {
          id: true,
          accountId: true,
          account: {
            select: {
              balance: true,
            },
          },
          userId: true,
          groupId: true,
          categoryId: true,
          category: {
            select: {
              name: true,
            },
          },
          amount: true,
          currency: true,
          description: true,
          date: true,
          type: true,
          accountRecipientId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return buildSuccessResponse(
        userTransactions,
        `All transactions list for user ID ${validUserId}`,
        HttpStatus.OK,
        '/transactions/all',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;

      handlePrismaError(error, {
        notFoundCode: ErrorCode.TRANSACTIONS_NOT_FOUND,
        notFoundMessage: 'Transactions not found',
        defaultMessage: 'Failed to fetch transactions list',
      });
    }
  }

  async createTransfer(transferData: CreateTransferDataDto, userId: number) {
    try {
      validateTransfer(transferData, userId);

      const validUserId = validateRequiredId(
        userId,
        'user ID',
        ErrorCode.INVALID_USER_ID,
      );

      const created = await this.database.$transaction(async (tx) => {
        const sourceAccount = await tx.account.findUnique({
          where: { id: transferData.accountId },
          select: { id: true, balance: true, ownerId: true, currency: true },
        });

        if (!sourceAccount) {
          this.logger.warn('Source account not found');
          throw new ApiErrorException(
            'Source account not found',
            ErrorCode.ACCOUNT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }

        if (sourceAccount.ownerId !== validUserId) {
          this.logger.warn('User does not have access to this account');
          throw new ApiErrorException(
            'You do not have permission to transfer from this account',
            ErrorCode.UNAUTHORIZED,
            HttpStatus.UNAUTHORIZED,
          );
        }

        if (sourceAccount.balance.toNumber() < transferData.amount) {
          this.logger.warn('Insufficient balance');
          throw new ApiErrorException(
            'Insufficient balance',
            ErrorCode.VALIDATION_ERROR,
            HttpStatus.BAD_REQUEST,
          );
        }

        const destinationAccount = await tx.account.findUnique({
          where: { id: transferData.accountRecipientId },
          select: { id: true, ownerId: true, currency: true },
        });

        if (!destinationAccount) {
          this.logger.warn('Destination account not found');
          throw new ApiErrorException(
            'Destination account not found',
            ErrorCode.ACCOUNT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }

        if (destinationAccount.ownerId !== validUserId) {
          this.logger.warn('User does not have access to destination account');
          throw new ApiErrorException(
            'You do not have permission to transfer to this account',
            ErrorCode.UNAUTHORIZED,
            HttpStatus.UNAUTHORIZED,
          );
        }

        const { data } = await this.exchangeRateService.getRates();
        const { rates } = data;
        const sourceCurrency = sourceAccount.currency as CurrencyType;
        const destinationCurrency = destinationAccount.currency as CurrencyType;

        const amountToCredit = await this.exchangeRateService.convertAmount(
          transferData.amount,
          sourceCurrency,
          destinationCurrency,
          rates,
        );

        const transfer = await tx.transaction.create({
          data: {
            accountId: transferData.accountId,
            accountRecipientId: transferData.accountRecipientId,
            userId: validUserId,
            groupId: transferData.groupId,
            categoryId: transferData.categoryId,
            amount: transferData.amount,
            currency: sourceCurrency,
            description: transferData.description,
            date: transferData.date ?? new Date().toISOString(),
            type: TransactionType.TRANSFER,
          },
          select: {
            id: true,
            accountId: true,
            accountRecipientId: true,
            userId: true,
            groupId: true,
            categoryId: true,
            amount: true,
            currency: true,
            description: true,
            date: true,
            type: true,
            createdAt: true,
          },
        });

        await tx.account.update({
          where: { id: transferData.accountId },
          data: { balance: { decrement: transferData.amount } },
        });

        await tx.account.update({
          where: { id: transferData.accountRecipientId },
          data: { balance: { increment: amountToCredit } },
        });

        return transfer;
      });

      return buildSuccessResponse(
        created,
        `Transfer successfully created`,
        HttpStatus.CREATED,
        '/transactions/transfer',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;

      handlePrismaError(error, {
        badRequestCode: ErrorCode.VALIDATION_ERROR,
        badRequestMessage: 'Invalid transfer data',
        notFoundCode: ErrorCode.ACCOUNT_NOT_FOUND,
        notFoundMessage: 'Account not found',
        defaultMessage: 'Failed to create new transfer',
      });
    }
  }
}
