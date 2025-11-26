import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
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

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private database: DatabaseService) {}

  // update user profile; userId is extracted from token
  async updateUserProfile(userId: number, userData: UpdateUserProfileDto) {
    try {
      if (!userId || isNaN(userId)) {
        this.logger.warn('Invalid userId provided');
        throw new BadRequestException('Invalid userId');
      }

      if (!userData) {
        this.logger.warn('No user data provided');
        throw new BadRequestException('User data is not valid');
      }

      this.logger.debug(`Updating profile for user [ID: ${userId}]`);

      const updatedProfile = await this.database.user.update({
        where: {
          id: userId,
        },
        data: {
          name: userData.name,
          birthdate: userData.birthdate,
        },
        select: {
          id: true,
          email: true,
          name: true,
          birthdate: true,
          updatedAt: true,
        },
      });

      this.logger.log(`Profile updated successfully for user [ID: ${userId}]`);

      return {
        message: 'User profile updated',
        profile: updatedProfile,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      if ((error as any)?.code === 'P2025') {
        this.logger.warn(`User not found [ID: ${userId}]`);
        throw new BadRequestException('User not found');
      }

      const errMessage = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to update user profile [ID: ${userId}]: ${errMessage}`,
        errStack
      );
      throw new BadRequestException(`Failed to update user profile`);
    }
  }

  async updateUserPassword(
    userId: number,
    passwordData: UpdateUserPasswordDto
  ) {
    try {
      if (!userId || isNaN(userId)) {
        this.logger.warn('Invalid userId provided');
        throw new BadRequestException('Invalid userId');
      }

      if (!passwordData) {
        this.logger.warn('Invalid passwordData');
        throw new BadRequestException('passwordData is not valid');
      }

      const user = await this.database.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          passwordHash: true,
        },
      });

      if (!user) {
        this.logger.warn('User not found');
        throw new UnauthorizedException('User not found');
      }

      const isPasswordValid = await argon2.verify(
        user.passwordHash,
        passwordData.oldPassword
      );

      if (!isPasswordValid) {
        this.logger.warn(
          'Failed password update attempt. Invalid old password'
        );
        throw new UnauthorizedException('Invalid password');
      }

      const newPasswordHash = await argon2.hash(passwordData.newPassword);

      const result = await this.database.user.update({
        where: {
          id: userId,
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

      return {
        message: `User ${result.email} updated password`,
        data: result,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      const errMessage = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Unexpected error updating password: ${errMessage}`,
        errStack
      );
      throw new BadRequestException(`Failed to update user password`);
    }
  }

  async updateUserEmail(userId: number, emailData: UpdateUserEmailDto) {
    try {
      if (!userId || isNaN(userId)) {
        this.logger.warn('Invalid userId provided');
        throw new ApiErrorException(
          'Invalid user ID',
          ErrorCode.INVALID_USER_ID,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!emailData || !emailData.newEmail) {
        this.logger.warn('Email data is missing');
        throw new ApiErrorException(
          'Email is required',
          ErrorCode.EMAIL_REQUIRED,
          HttpStatus.BAD_REQUEST
        );
      }

      const updatedEmail = await this.database.user.update({
        where: {
          id: userId,
        },
        data: {
          email: emailData.newEmail,
        },
        select: {
          id: true,
          email: true,
          updatedAt: true,
        },
      });

      return {
        message: 'Email updated successfully',
        data: updatedEmail,
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof ApiErrorException) {
        throw error;
      }

      const err = error as any;

      if (err?.code === 'P2025') {
        this.logger.warn(`User not found [ID: ${userId}]`);
        throw new ApiErrorException(
          'User not found',
          ErrorCode.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      if (err?.code === 'P2002') {
        this.logger.warn(`Email already exists: ${emailData.newEmail}`);
        throw new ApiErrorException(
          'Email is already in use. Please use a different email.',
          ErrorCode.DUPLICATE_EMAIL,
          HttpStatus.CONFLICT
        );
      }

      const errMessage = err instanceof Error ? err.message : String(err);
      const errStack = err instanceof Error ? err.stack : undefined;

      this.logger.error(
        `Failed to update email for user [ID: ${userId}]: ${errMessage}`,
        errStack
      );
      throw new ApiErrorException(
        'Failed to update email. Please try again later.',
        ErrorCode.DATABASE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
