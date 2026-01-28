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
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import {
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
  UpdateUserProfileDto,
} from './dto/update.dto.js';
import { UserService } from './user.service.js';
import { setCookie } from '../../common/utils/setCookie.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { buildSuccessResponse } from '../../common/utils/response.js';

@ApiUnauthorizedResponse({
  description: 'Unauthorized - Invalid or missing JWT token',
})
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Put('profile')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates user profile information (name, date of birth).',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @Body() userData: UpdateUserProfileDto,
    @CurrentUser() user: { sub: number },
  ) {
    return await this.userService.updateUserProfile(user.sub, userData);
  }

  @Put('password')
  @ApiOperation({
    summary: 'Update user password',
    description:
      'Changes the user password. Requires current password for verification. Returns new tokens.',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updateUserPassword(
    @Body() passwordData: UpdateUserPasswordDto,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: { sub: number },
  ) {
    const result = await this.userService.updateUserPassword(
      user.sub,
      passwordData,
    );

    const payload = { sub: result.data.id, email: result.data.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    setCookie(res as Response, 'refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    setCookie(res as Response, 'access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 15,
    });

    return buildSuccessResponse(
      {
        data: result.data,
        accessToken,
        refreshIssued: true,
      },
      'Password changed',
      HttpStatus.OK,
      '/user/password',
    );
  }

  @Put('email')
  @ApiOperation({
    summary: 'Update user email',
    description:
      'Changes the user email address. Returns new tokens with updated email claim.',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updateUserEmail(
    @Body() email: UpdateUserEmailDto,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: { sub: number },
  ) {
    const result = await this.userService.updateUserEmail(user.sub, email);

    const payload = { sub: result.data.id, email: result.data.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    setCookie(res as Response, 'refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    setCookie(res as Response, 'access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 15,
    });

    return buildSuccessResponse(
      {
        data: result.data,
        accessToken,
        refreshIssued: true,
      },
      'Email changed',
      HttpStatus.OK,
      '/user/email',
    );
  }
}
