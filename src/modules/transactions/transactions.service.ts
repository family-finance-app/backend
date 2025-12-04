import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { DatabaseService } from '../../database/database.service.js';
import { CreateTransactionDto } from './dto/create-tr.dto.js';
import { UpdateTransactionDto } from './dto/update-tr.dto.js';
import { CreateTransferDataDto } from './dto/transfer.dto.js';
import { validateTransfer } from '../../common/utils/validateTransfer.js';

type InternalCreateTransaction = CreateTransactionDto & {
  userId: number;
  date?: string;
};

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  constructor(private database: DatabaseService) {}

  async createTransaction(transactionData: InternalCreateTransaction) {
    if (!transactionData.userId) {
      throw new BadRequestException('userId is required');
    }

    try {
      const created = await this.database.$transaction(async (tx) => {
        const tr = await tx.transaction.create({
          data: {
            amount: transactionData.amount,
            description: transactionData.description ?? undefined,
            currency: transactionData.currency,
            account: { connect: { id: transactionData.accountId } },
            user: { connect: { id: transactionData.userId } },
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
        } else if (transactionData.type === TransactionType.TRANSFER) {
          // logics needs to be implemented
          throw new BadRequestException(
            'Use transfer endpoint to move funds between accounts'
          );
        }

        return tr;
      });

      return {
        message: 'Transaction has been successfully created',
        transaction: created,
        status: 'success',
        statusCode: 201,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateTransaction(
    userId: number,
    transactionData: UpdateTransactionDto
  ) {
    try {
      const existingTransaction = await this.database.transaction.findUnique({
        where: {
          id: transactionData.id,
        },
      });

      if (!existingTransaction) {
        throw new BadRequestException('Transaction not found');
      }

      if (existingTransaction.userId !== userId) {
        throw new BadRequestException(
          'You do not have permission to update this transaction'
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

        if (transactionData.type === TransactionType.INCOME) {
          await tx.account.update({
            where: { id: existingTransaction.accountId },
            data: { balance: { increment: transactionData.amount } },
          });
        } else if (transactionData.type === TransactionType.EXPENSE) {
          await tx.account.update({
            where: { id: existingTransaction.accountId },
            data: { balance: { decrement: transactionData.amount } },
          });
        } else if (transactionData.type === TransactionType.TRANSFER) {
          throw new BadRequestException(
            'Use transfer endpoint to move funds between accounts'
          );
        }

        const tr = await tx.transaction.update({
          where: { id: transactionData.id },
          data: {
            amount: transactionData.amount,
            description: transactionData.description ?? undefined,
            category: { connect: { id: transactionData.categoryId } },
            type: transactionData.type,
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
          },
        });

        return tr;
      });

      return {
        message: 'Transaction has been successfully updated',
        transaction: updated,
        status: 'success',
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteTransaction(userId: number, transactionId: number) {
    try {
      const existingTransaction = await this.database.transaction.findUnique({
        where: {
          id: transactionId,
        },
      });

      if (!existingTransaction) {
        throw new BadRequestException('Transaction not found');
      }

      if (existingTransaction.userId !== userId) {
        throw new BadRequestException(
          'You do not have permission to delete this transaction'
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

        const tr = await tx.transaction.delete({
          where: { id: transactionId },
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
          },
        });

        return tr;
      });

      return {
        message: 'Transaction has been successfully deleted',
        transaction: deleted,
        status: 'success',
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getUserTransactionsById(userId: number) {
    try {
      const userTransactions = await this.database.transaction.findMany({
        where: {
          userId: userId,
        },
        select: {
          id: true,
          accountId: true,
          userId: true,
          groupId: true,
          categoryId: true,
          amount: true,
          currency: true,
          description: true,
          date: true,
          type: true,
          accountRecipientId: true,
        },
      });
      return userTransactions;
    } catch (error) {
      throw new Error(
        `Failed to fetch transactions: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async createTransfer(transferData: CreateTransferDataDto, userId: number) {
    try {
      validateTransfer(transferData, userId);
      const created = await this.database.$transaction(async (tx) => {
        const sourceAccount = await tx.account.findUnique({
          where: { id: transferData.accountId },
          select: { id: true, balance: true, ownerId: true },
        });

        if (!sourceAccount) {
          this.logger.warn('Source account not found');
          throw new BadRequestException('Source account not found');
        }

        if (sourceAccount.ownerId !== userId) {
          this.logger.warn('User does not have access to this account');
          throw new BadRequestException(
            'You do not have permission to transfer from this account'
          );
        }

        if (sourceAccount.balance.toNumber() < transferData.amount) {
          this.logger.warn('Insufficient balance');
          throw new BadRequestException('Insufficient balance');
        }

        const destinationAccount = await tx.account.findUnique({
          where: { id: transferData.accountRecipientId },
          select: { id: true },
        });

        if (!destinationAccount) {
          this.logger.warn('Destination account not found');
          throw new BadRequestException('Destination account not found');
        }

        const transfer = await tx.transaction.create({
          data: {
            accountId: transferData.accountId,
            accountRecipientId: transferData.accountRecipientId,
            userId: userId,
            groupId: transferData.groupId,
            categoryId: transferData.categoryId,
            amount: transferData.amount,
            currency: transferData.currency,
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
          },
        });

        await tx.account.update({
          where: { id: transferData.accountId },
          data: { balance: { decrement: transferData.amount } },
        });

        await tx.account.update({
          where: { id: transferData.accountRecipientId },
          data: { balance: { increment: transferData.amount } },
        });

        return transfer;
      });

      return {
        message: 'Transfer has been successfully created',
        transfer: created,
        status: 'success',
        statusCode: 201,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(
        'Failed to create transfer',
        error instanceof Error ? error.stack : String(error)
      );
      throw new BadRequestException('Failed to create transfer');
    }
  }
}
