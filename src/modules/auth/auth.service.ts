import { Injectable, HttpStatus } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto.js';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto.js';
import { getCookie } from '../../common/utils/parseCookie.js';
import { Request } from 'express';
import { DatabaseService } from '../../database/database.service.js';
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
export class AuthService {
  constructor(private database: DatabaseService) {}

  async signup(signupData: SignUpDto) {
    try {
      const validEmail = validateRequiredString(
        signupData.email,
        'Email',
        ErrorCode.INVALID_EMAIL,
      );

      const existingUser = await this.database.user.findUnique({
        where: { email: validEmail },
      });

      if (existingUser) {
        throw new ApiErrorException(
          'User already exists',
          ErrorCode.DUPLICATE_EMAIL,
          HttpStatus.CONFLICT,
        );
      }

      const hashedPassword = await argon2.hash(signupData.password);

      const newUser = await this.database.user.create({
        data: {
          email: validEmail,
          passwordHash: hashedPassword,
          terms: signupData.terms,
          role: signupData.role || 'MEMBER',
        },
        select: {
          id: true,
          email: true,
          terms: true,
          createdAt: true,
        },
      });

      return buildSuccessResponse(
        newUser,
        'New user has been successfully created',
        HttpStatus.CREATED,
        '/auth/signup',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;
      handlePrismaError(error, {
        conflictCode: ErrorCode.DUPLICATE_EMAIL,
        conflictMessage: 'Account with the provided email already exists',
        badRequestCode: ErrorCode.EMAIL_REQUIRED,
        badRequestMessage: 'Email is empty or absent.',
        defaultMessage: 'Failed to create user. Please try again later.',
      });
    }
  }

  async login(loginData: LoginDto) {
    const validEmail = loginData.email.trim();

    try {
      const user = await this.database.user.findUnique({
        where: { email: validEmail },
        select: {
          id: true,
          passwordHash: true,
          email: true,
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
        loginData.password,
      );

      if (!isPasswordValid) {
        throw new ApiErrorException(
          'Invalid password',
          ErrorCode.INVALID_PASSWORD,
          HttpStatus.BAD_REQUEST,
        );
      }

      const { passwordHash, ...userData } = user;

      return buildSuccessResponse(
        userData,
        'Login successful',
        HttpStatus.OK,
        '/auth/login',
      );
    } catch (error) {
      if (error instanceof ApiErrorException) throw error;
      handlePrismaError(error, {
        notFoundCode: ErrorCode.USER_NOT_FOUND,
        notFoundMessage: 'User not found',
        defaultMessage: 'Login failed. Please try again later.',
      });
    }
  }

  async getUserById(userId: number) {
    try {
      const validUserId = validateRequiredId(
        userId,
        'user ID',
        ErrorCode.INVALID_USER_ID,
      );

      const user = await this.database.user.findUnique({
        where: { id: validUserId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          birthdate: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new ApiErrorException(
          'User not found',
          ErrorCode.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      return buildSuccessResponse(
        user,
        `${user.id}`,
        HttpStatus.OK,
        '/auth/me',
      );
    } catch (error: unknown) {
      if (error instanceof ApiErrorException) throw error;
      handlePrismaError(error, {
        notFoundCode: ErrorCode.USER_NOT_FOUND,
        notFoundMessage: 'User not found',
        badRequestCode: ErrorCode.INVALID_USER_ID,
        badRequestMessage: 'Invalid user ID',
        defaultMessage:
          'Failed to fetch user data. Please provide valid user ID or try again later',
      });
    }
  }

  refresh(req: Request) {
    return getCookie(req, 'refresh_token');
  }
}
