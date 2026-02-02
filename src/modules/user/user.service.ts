import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import {
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
  UpdateUserProfileDto,
} from './dto/update.dto.js';
import * as argon2 from 'argon2';
import {
  ApiErrorException,
  ErrorCode,
} from '../../common/exceptions/api-error.exception.js';
import {
  validateRequiredId,
  validateRequiredString,
} from '../../common/utils/validation.js';
import { buildSuccessResponse } from '../../common/utils/response.js';
import { handlePrismaError } from '../../common/utils/prisma-error.js';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private database: DatabaseService) {}

  async updateUserProfile(userId: number, userData: UpdateUserProfileDto) {
    try {
      const validUserId = validateRequiredId(
        userId,
        'user ID',
        ErrorCode.INVALID_USER_ID,
      );

      const validUserName = validateRequiredString(
        userData.name,
        'User name',
        ErrorCode.VALIDATION_ERROR,
      );

      const updatedProfile = await this.database.user.update({
        where: {
          id: validUserId,
        },
        data: {
          name: validUserName,
          birthdate: userData.birthdate ? userData.birthdate : null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          birthdate: true,
          updatedAt: true,
        },
      });

      return buildSuccessResponse(
        updatedProfile,
        'User profile updated successfully',
        HttpStatus.OK,
        '/user/profile',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;

      handlePrismaError(error, {
        badRequestCode: ErrorCode.VALIDATION_ERROR,
        badRequestMessage: 'Invalid data',
        notFoundCode: ErrorCode.USER_NOT_FOUND,
        notFoundMessage: 'Invalid user ID',
        defaultMessage: 'Failed to update user profile',
      });
    }
  }

  async updateUserPassword(
    userId: number,
    passwordData: UpdateUserPasswordDto,
  ) {
    try {
      const validUserId = validateRequiredId(
        userId,
        'user ID',
        ErrorCode.INVALID_USER_ID,
      );

      const user = await this.database.user.findUnique({
        where: {
          id: validUserId,
        },
        select: {
          passwordHash: true,
        },
      });

      if (!user) {
        throw new ApiErrorException(
          'User not found',
          ErrorCode.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const isPasswordValid = await argon2.verify(
        user.passwordHash,
        passwordData.oldPassword,
      );

      if (!isPasswordValid) {
        throw new ApiErrorException(
          'Invalid old password',
          ErrorCode.INVALID_PASSWORD,
          HttpStatus.BAD_REQUEST,
        );
      }

      const newPasswordHash = await argon2.hash(passwordData.newPassword);

      const result = await this.database.user.update({
        where: {
          id: validUserId,
        },
        data: {
          passwordHash: newPasswordHash,
        },
        select: {
          id: true,
          email: true,
          updatedAt: true,
        },
      });

      return buildSuccessResponse(
        result,
        'Password has been successfully updated',
        HttpStatus.OK,
        '/user/password',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;

      handlePrismaError(error, {
        badRequestCode: ErrorCode.VALIDATION_ERROR,
        badRequestMessage: 'Invalid password',
        notFoundCode: ErrorCode.USER_NOT_FOUND,
        notFoundMessage: 'Invalid user ID',
        defaultMessage: 'Failed to update password',
      });
    }
  }

  async updateUserEmail(userId: number, emailData: UpdateUserEmailDto) {
    try {
      const validUserId = validateRequiredId(
        userId,
        'user ID',
        ErrorCode.INVALID_USER_ID,
      );

      const validEmail = validateRequiredString(
        emailData.newEmail,
        'Email',
        ErrorCode.INVALID_EMAIL,
      );

      const existingRecord = await this.database.user.findFirst({
        where: {
          email: validEmail,
        },
        select: {
          email: true,
        },
      });

      if (existingRecord?.email === validEmail) {
        throw new ApiErrorException(
          'Email already exists',
          ErrorCode.DUPLICATE_EMAIL,
          HttpStatus.CONFLICT,
        );
      }

      const updatedEmail = await this.database.user.update({
        where: {
          id: validUserId,
        },
        data: {
          email: validEmail,
        },
        select: {
          id: true,
          email: true,
          updatedAt: true,
        },
      });

      return buildSuccessResponse(
        updatedEmail,
        'Email has been successfully updated',
        HttpStatus.OK,
        '/user/email',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;

      handlePrismaError(error, {
        conflictCode: ErrorCode.DUPLICATE_EMAIL,
        conflictMessage: 'Email already exists',
        badRequestCode: ErrorCode.VALIDATION_ERROR,
        badRequestMessage: 'Invalid user ID',
        notFoundCode: ErrorCode.USER_NOT_FOUND,
        notFoundMessage: 'Invalid user ID',
        defaultMessage: 'Failed to update email',
      });
    }
  }
}
