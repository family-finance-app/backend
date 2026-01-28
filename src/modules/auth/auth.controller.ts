import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  HttpCode,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SignUpDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { setCookie } from '../../common/utils/setCookie.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { buildSuccessResponse } from '../../common/utils/response.js';
import {
  ApiErrorException,
  ErrorCode,
} from '../../common/exceptions/api-error.exception.js';
import { Throttle } from '@nestjs/throttler';
import type { StringValue } from 'ms';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
    description:
      'Returns the authenticated user profile data based on the JWT token.',
  })
  @ApiBearerAuth('accessToken')
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: { sub: number; email: string }) {
    return await this.authService.getUserById(user.sub);
  }

  @Post('signup')
  @ApiOperation({
    summary: 'Create new user',
    description:
      'Creates a new user account. Returns access token and sets refresh token cookie.',
  })
  async signup(
    @Body() signupDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(signupDto);

    const payload = { sub: result.data.id, email: result.data.email };
    const accessToken = this.jwtService.sign(
      payload,
      this.buildSignOptions('3m'),
    );
    const refreshToken = this.jwtService.sign(
      payload,
      this.buildSignOptions('7d'),
    );

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
      maxAge: 1000 * 60 * 3,
    });

    return buildSuccessResponse(
      {
        user: result.data,
        accessToken,
        refreshIssued: true,
      },
      'Signup successful',
      HttpStatus.CREATED,
      '/auth/signup',
    );
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates user with email and password. Returns access token and sets refresh token cookie.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid email or password',
  })
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    const payload = { sub: result.data.id, email: result.data.email };
    const accessToken = this.jwtService.sign(
      payload,
      this.buildSignOptions('3m'),
    );
    const refreshToken = this.jwtService.sign(
      payload,
      this.buildSignOptions('7d'),
    );

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
      maxAge: 1000 * 60 * 3,
    });

    return buildSuccessResponse(
      {
        user: result.data,
        accessToken,
        refreshIssued: true,
      },
      'Login successful',
      HttpStatus.OK,
      '/auth/login',
    );
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Uses refresh token from cookie to generate new access and refresh tokens.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing refresh token',
  })
  @HttpCode(200)
  refresh(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const refreshToken = this.authService.refresh(req);
    if (!refreshToken)
      throw new ApiErrorException(
        'No refresh token',
        ErrorCode.REFRESH_TOKEN_INVALID,
        HttpStatus.UNAUTHORIZED,
      );

    let payload: { sub: number | string; email: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new ApiErrorException(
        'Invalid refresh token',
        ErrorCode.REFRESH_TOKEN_INVALID,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userId =
      typeof payload.sub === 'string' ? Number(payload.sub) : payload.sub;
    if (!userId || Number.isNaN(userId)) {
      throw new ApiErrorException(
        'Invalid refresh token payload',
        ErrorCode.REFRESH_TOKEN_INVALID,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const newAccess = this.jwtService.sign(
      { sub: userId, email: payload.email },
      this.buildSignOptions('3m'),
    );
    const newRefresh = this.jwtService.sign(
      { sub: userId, email: payload.email },
      this.buildSignOptions('7d'),
    );

    setCookie(res as Response, 'refresh_token', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    setCookie(res as Response, 'access_token', newAccess, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 3,
    });

    return buildSuccessResponse(
      {
        accessToken: newAccess,
        refreshIssued: true,
      },
      'Token refreshed',
      HttpStatus.OK,
      '/auth/refresh',
    );
  }

  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'Clears the refresh token cookie and logs out the user.',
  })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('access_token', { path: '/' });
    return buildSuccessResponse(
      null,
      'Logout successful',
      HttpStatus.OK,
      '/auth/logout',
    );
  }

  private buildSignOptions(expiresIn: StringValue) {
    const issuer = process.env.JWT_ISSUER;
    const audience = process.env.JWT_AUDIENCE;

    return {
      expiresIn,
      ...(issuer ? { issuer } : {}),
      ...(audience ? { audience } : {}),
    };
  }
}
