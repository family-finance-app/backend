import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Param,
  Res,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
  UpdateUserProfileDto,
} from './dto/update.dto';
import { UserService } from './user.service';
import { setCookie } from '../../common/utils/setCookie';
import { ApiErrorException } from '../../common/exceptions/api-error.exception';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  // update name, date of birth
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @Body() userData: UpdateUserProfileDto,
    @CurrentUser() user: { sub: number }
  ) {
    try {
      return await this.userService.updateUserProfile(user.sub, userData);
    } catch (error) {
      this.logger.error(
        `Failed to update profile for user ${user.sub}: ${error.message}`
      );
      throw error;
    }
  }

  // update user password
  @Put('password')
  @UseGuards(JwtAuthGuard)
  async updateUserPassword(
    @Body() passwordData: UpdateUserPasswordDto,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: { sub: number }
  ) {
    try {
      const result = await this.userService.updateUserPassword(
        user.sub,
        passwordData
      );

      const payload = { sub: result.data.id, email: result.data.email };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: '7d',
      });

      setCookie(res as Response, 'refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      return {
        ...result,
        accessToken,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      this.logger.error(`Error while updating password: ${error.message}`);
      throw new BadRequestException('Failed to update password');
    }
  }

  @Put('email')
  @UseGuards(JwtAuthGuard)
  async updateUserEmail(
    @Body() email: UpdateUserEmailDto,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: { sub: number }
  ) {
    try {
      const result = await this.userService.updateUserEmail(user.sub, email);

      const payload = { sub: result.data.id, email: result.data.email };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: '7d',
      });

      setCookie(res as Response, 'refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

      return { ...result, accessToken };
    } catch (error) {
      if (error instanceof ApiErrorException) {
        this.logger.warn(`Email update failed`);
        throw error;
      }

      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      this.logger.error(`Unexpected error updating email`);
      throw new BadRequestException('Failed to update email');
    }
  }
}
