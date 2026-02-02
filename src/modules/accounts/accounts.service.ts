import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { CreateFinAccountDataDto } from './dto/create.dto.js';
import { UpdateAccountDto } from './dto/update.dto.js';
import {
  ApiErrorException,
  ErrorCode,
} from '../../common/exceptions/api-error.exception.js';
import { buildSuccessResponse } from '../../common/utils/response.js';
import { handlePrismaError } from '../../common/utils/prisma-error.js';
import {
  validateRequiredId,
  validateRequiredString,
} from '../../common/utils/validation.js';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(private database: DatabaseService) {}

  async createFinAccount(finAccountData: CreateFinAccountDataDto) {
    try {
      const validOwnerId = validateRequiredId(
        finAccountData.ownerId,
        'user ID',
        ErrorCode.INVALID_USER_ID,
      );

      const validAccountName = validateRequiredString(
        finAccountData.name,
        'Account name',
        ErrorCode.VALIDATION_ERROR,
      );

      const existingAccount = await this.database.account.findFirst({
        where: {
          name: validAccountName,
          type: finAccountData.type,
          ownerId: validOwnerId,
        },
      });

      if (existingAccount) {
        throw new ApiErrorException(
          `Account with name "${finAccountData.name}" and type "${finAccountData.type}" already exists`,
          ErrorCode.DUPLICATE_ACCOUNT,
          HttpStatus.CONFLICT,
        );
      }

      let groupId: number | undefined = undefined;

      if (finAccountData.groupId) {
        groupId = validateRequiredId(
          finAccountData.groupId,
          'group ID',
          ErrorCode.INVALID_GROUP_ID,
        );

        const existingGroup = await this.database.userGroup.findFirst({
          where: {
            userId: validOwnerId,
            groupId: groupId,
          },
        });

        if (!existingGroup) {
          throw new ApiErrorException(
            'User does not belong to group or group does not exist',
            ErrorCode.GROUP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }

        const newGroupAccount = await this.database.account.create({
          data: {
            name: validAccountName,
            type: finAccountData.type,
            balance: finAccountData.balance ?? 0,
            currency: finAccountData.currency,
            owner: {
              connect: { id: validOwnerId },
            },
            creator: {
              connect: { id: validOwnerId },
            },
          },
          select: {
            id: true,
            name: true,
            type: true,
            balance: true,
            currency: true,
            ownerId: true,
            createdAt: true,
          },
        });

        await this.database.accountsGroup.create({
          data: {
            accountId: newGroupAccount.id,
            groupId: groupId,
          },
        });

        const newAccount = { ...newGroupAccount, groupId };
        return buildSuccessResponse(
          newAccount,
          'New account has been successfully created',
          HttpStatus.CREATED,
          '/accounts/create',
        );
      }

      const newAccount = await this.database.account.create({
        data: {
          name: validAccountName,
          type: finAccountData.type,
          balance: finAccountData.balance ?? 0,
          currency: finAccountData.currency,
          owner: {
            connect: { id: validOwnerId },
          },
          creator: {
            connect: { id: validOwnerId },
          },
        },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
          currency: true,
          ownerId: true,
          createdAt: true,
        },
      });

      return buildSuccessResponse(
        newAccount,
        'New account has been successfully created',
        HttpStatus.CREATED,
        '/accounts/create',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;
      handlePrismaError(error, {
        conflictCode: ErrorCode.DUPLICATE_ACCOUNT,
        conflictMessage:
          'Account with the provided name and type already exists',
        badRequestCode: ErrorCode.USER_NOT_FOUND,
        badRequestMessage: 'User not found',
        defaultMessage: 'Failed to create account. Please try again later.',
      });
    }
  }

  // get user accounts by id, accounts/my
  async getUserAccountsById(userId: number) {
    try {
      const validUserId = validateRequiredId(
        userId,
        'user ID',
        ErrorCode.INVALID_USER_ID,
      );

      const userAccounts = await this.database.account.findMany({
        where: {
          ownerId: validUserId,
        },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
          currency: true,
          createdAt: true,
          ownerId: true,
        },
      });

      return buildSuccessResponse(
        userAccounts,
        `All accounts of user with ID ${userId}`,
        HttpStatus.OK,
        '/accounts/my',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;

      handlePrismaError(error, {
        notFoundCode: ErrorCode.USER_NOT_FOUND,
        notFoundMessage: 'User not found',
        defaultMessage: 'Failed to fetch accounts. Please try again later.',
      });
    }
  }

  // update account by id
  async updateAccountById(
    accountId: number,
    userId: number,
    accountData: UpdateAccountDto,
  ) {
    try {
      const validAccountId = validateRequiredId(
        accountId,
        'account ID',
        ErrorCode.INVALID_ACCOUNT_ID,
      );

      const validUserId = validateRequiredId(
        userId,
        'user ID',
        ErrorCode.INVALID_USER_ID,
      );

      const validAccountName = accountData.name.trim();

      const duplicate = await this.database.account.findFirst({
        where: {
          ownerId: validUserId,
          name: validAccountName,
          type: accountData.type,
          currency: accountData.currency,
          NOT: { id: validAccountId },
        },
      });

      if (duplicate) {
        throw new ApiErrorException(
          'Account with the provided name, type, and currency already exists',
          ErrorCode.DUPLICATE_ACCOUNT,
          HttpStatus.CONFLICT,
        );
      }

      const updatedAccount = await this.database.account.update({
        where: {
          id: validAccountId,
          ownerId: validUserId,
        },
        data: {
          name: validAccountName,
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

      return buildSuccessResponse(
        updatedAccount,
        'Account has been successfully updated',
        HttpStatus.OK,
        `/accounts/${validAccountId}`,
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;
      handlePrismaError(error, {
        conflictCode: ErrorCode.DUPLICATE_ACCOUNT,
        conflictMessage:
          'Account with the provided name, type, and currency already exists',
        notFoundCode: ErrorCode.ACCOUNT_NOT_FOUND,
        notFoundMessage: 'Account not found',
        defaultMessage: 'Failed to update account. Please try again later.',
      });
    }
  }

  // delete account by id
  async deleteAccountById(accountId: number, userId: number) {
    try {
      const validAccountId = validateRequiredId(
        accountId,
        'account ID',
        ErrorCode.INVALID_ACCOUNT_ID,
      );

      const validUserId = validateRequiredId(
        userId,
        'user ID',
        ErrorCode.INVALID_USER_ID,
      );

      await this.database.account.delete({
        where: {
          id: validAccountId,
          ownerId: validUserId,
        },
      });

      return buildSuccessResponse(
        validAccountId,
        `Account ${validAccountId} has been deleted`,
        HttpStatus.OK,
        `/accounts/${validAccountId}`,
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;

      handlePrismaError(error, {
        notFoundCode: ErrorCode.ACCOUNT_NOT_FOUND,
        notFoundMessage: 'Account not found or unauthorized',
        defaultMessage: 'Failed to delete account. Please try again later.',
      });
    }
  }
}
