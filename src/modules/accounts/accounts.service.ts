import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateFinAccountDataDto } from './dto/create.dto';

@Injectable()
export class AccountsService {
  constructor(private database: DatabaseService) {}

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
}
