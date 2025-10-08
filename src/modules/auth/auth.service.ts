import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { getCookie } from '../../common/utils/parseCookie';
import { Request } from 'express';
import { DatabaseService } from '../../database/database.service';

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
          role: signupData.role || 'MEMBER',
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return {
        message: 'New user has been successfully created',
        userData: newUser,
        userId: newUser.id,
        status: 'success',
        statusCode: 201,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create user: ${error.message}`);
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
        message: 'Login action executed successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Login failed: ${error.message}`);
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
