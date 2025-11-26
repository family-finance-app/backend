import {
  Injectable,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { CreateFinAccountDataDto } from './dto/create.dto.js';
import { UpdateAccountDto } from './dto/update.dto.js';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(private database: DatabaseService) {}

  // create new account
  async createFinAccount(finAccountData: CreateFinAccountDataDto) {
    try {
      // check if the same account already exists
      const existingAccount = await this.database.account.findFirst({
        where: {
          name: finAccountData.name,
          type: finAccountData.type,
          ownerId: finAccountData.ownerId,
        },
      });

      if (existingAccount) {
        throw new ConflictException(
          `Account with name "${finAccountData.name}" and type "${finAccountData.type}" already exists`
        );
      }

      const newAccount = await this.database.account.create({
        data: {
          name: finAccountData.name,
          type: finAccountData.type,
          balance: finAccountData.balance ?? 0,
          currency: finAccountData.currency ?? 'UAH',
          owner: {
            connect: { id: finAccountData.ownerId },
          },
          creator: {
            connect: { id: finAccountData.ownerId },
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
          currency: true,
          createdAt: true,
        },
      });

      return {
        message: 'New account has been successfully created',
        accountData: newAccount,
        accountId: newAccount.id,
        status: 'success',
        statusCode: 201,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(
        `Failed to create account: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  // get user accounts by id, accounts/my
  async getUserAccountsById(userId: number) {
    try {
      const userAccounts = await this.database.account.findMany({
        where: {
          ownerId: userId,
        },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
          currency: true,
          createdAt: true,
          owner: {
            select: {
              email: true,
            },
          },
        },
      });

      return userAccounts;
    } catch (error) {
      throw new Error(
        `Failed to fetch accounts: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  // get account by id to verify ownership
  async getAccountById(accountId: number) {
    try {
      if (!accountId || isNaN(accountId)) {
        return null;
      }

      const account = await this.database.account.findUnique({
        where: {
          id: accountId,
        },
        select: {
          id: true,
          name: true,
          ownerId: true,
          createdBy: true,
        },
      });

      return account;
    } catch (error) {
      console.error('Error fetching account:', error);
      return null;
    }
  }

  // update account by id
  async updateAccountById(
    accountId: number,
    userId: number,
    accountData: UpdateAccountDto
  ) {
    try {
      if (!accountId || isNaN(accountId)) {
        this.logger.warn('Invalid accountId');
        throw new BadRequestException('Invalid accountId');
      }

      if (!userId || isNaN(userId)) {
        this.logger.warn('Invalid userId');
        throw new BadRequestException('Invalid userId');
      }

      const updatedAccount = await this.database.account.update({
        where: {
          id: accountId,
        },
        data: {
          name: accountData.name,
          type: accountData.type,
          currency: accountData.currency,
        },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
          currency: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.debug(updatedAccount);

      return {
        message: 'Account updated',
        account: updatedAccount,
        status: 'success',
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to update account: ${errorMessage}`
      );
    }
  }

  // delete account by id
  async deleteAccountById(accountId: number, userId: number) {
    try {
      if (!accountId || isNaN(accountId)) {
        this.logger.warn('Invalid accountId');
        throw new BadRequestException('Invalid accountId');
      }

      if (isNaN(accountId)) {
        this.logger.warn('accountId is NaN');
        throw new BadRequestException('accountId is Nan');
      }

      if (!userId || isNaN(userId)) {
        this.logger.warn('Invalid userId');
        throw new BadRequestException('Invalid userId');
      }

      if (isNaN(userId)) {
        this.logger.warn('userId is NaN');
        throw new BadRequestException('userId is NaN');
      }

      await this.database.account.delete({
        where: {
          id: accountId,
          ownerId: userId,
        },
      });

      this.logger.debug(
        `Account ${accountId} has been deleted by user ${userId}`
      );

      return {
        message: `Account ${accountId} has been deleted`,
        accountId,
        status: 'success',
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      const prismaCode =
        typeof error === 'object' && error !== null && 'code' in error
          ? (error as { code?: string }).code
          : undefined;

      if (prismaCode === 'P2025') {
        this.logger.warn('Account not found or unauthorized');
        throw new BadRequestException('Account not found or unauthorized');
      }

      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`Failed to delete account ${accountId}:`, errorStack);
      throw new BadRequestException(
        `Failed to delete account: ${errorMessage}`
      );
    }
  }
}
