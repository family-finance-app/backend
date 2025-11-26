import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto.js';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto.js';
import { getCookie } from '../../common/utils/parseCookie.js';
import { Request } from 'express';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class AuthService {
  constructor(private database: DatabaseService) {}

  async signup(signupData: SignUpDto) {
    try {
      // check if user already exists
      const existingUser = await this.database.user.findUnique({
        where: { email: signupData.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await argon2.hash(signupData.password);

      // create a new user
      const newUser = await this.database.user.create({
        data: {
          email: signupData.email,
          passwordHash: hashedPassword,
          terms: signupData.terms,
          role: signupData.role || 'MEMBER',
        },
        select: {
          id: true,
          email: true,
          terms: true,
          role: true,
          createdAt: true,
        },
      });

      return {
        message: 'New user has been successfully created',
        userData: newUser,
        status: 'success',
        statusCode: 201,
      };
    } catch (error: unknown) {
      if (error instanceof ConflictException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create user: ${message}`);
    }
  }

  async login(loginData: LoginDto) {
    try {
      const user = await this.database.user.findUnique({
        where: { email: loginData.email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await argon2.verify(
        user.passwordHash,
        loginData.password
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      return {
        message: 'Login successful!',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Login failed: ${message}`);
    }
  }

  async getUserById(userId: number) {
    try {
      const user = await this.database.user.findUnique({
        where: { id: userId },
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
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get user: ${message}`);
    }
  }

  refresh(req: Request) {
    return getCookie(req, 'refresh_token');
  }

  healthCheck() {
    return {
      message: 'Auth module is available',
      status: 'healthy',
    };
  }
}
