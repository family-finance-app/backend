import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateFinAccountDataDto } from './dto/create.dto';

@Injectable()
export class AccountsService {
  constructor(private database: DatabaseService) {}

  // create new account, accounts/create endpoint
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

      // create a new financial account
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
      throw new Error(`Failed to create account: ${error.message}`);
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
          owner: {
            select: {
              email: true,
            },
          },
        },
      });

      return userAccounts;
    } catch (error) {
      throw new Error(`Failed to fetch accounts: ${error.message}`);
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

  // delete account by id
  async deleteAccount(accountId: number) {
    try {
      await this.database.account.delete({
        where: {
          id: accountId,
        },
      });

      return {
        message: 'Account has been successfully deleted',
        accountId,
        status: 'success',
        statusCode: 200,
      };
    } catch (error) {
      throw new Error(`Failed to delete account: ${error.message}`);
    }
  }
}
