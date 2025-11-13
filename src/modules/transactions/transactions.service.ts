import { Injectable, BadRequestException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';
import { CreateTransactionDto } from './dto/create-tr.dto';
import { UpdateTransactionDto } from './dto/update-tr.dto';

type InternalCreateTransaction = CreateTransactionDto & {
  userId: number;
  date?: string;
};

@Injectable()
export class TransactionsService {
  constructor(private database: DatabaseService) {}

  async createTransaction(transactionData: InternalCreateTransaction) {
    console.log(transactionData);

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
        },
      });
      return userTransactions;
    } catch (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }
}
