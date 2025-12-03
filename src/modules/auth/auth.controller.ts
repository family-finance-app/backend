import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UnauthorizedException,
  Req,
  HttpCode,
  UseGuards,
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

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly jwtService: JwtService
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
    const userData = await this.authService.getUserById(user.sub);
    return {
      message: 'User data retrieved successfully',
      user: userData,
    };
  }

  @Post('signup')
  @ApiOperation({
    summary: 'Create new user',
    description:
      'Creates a new user account. Returns access token and sets refresh token cookie.',
  })
  async signup(
    @Body() signupDto: SignUpDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.signup(signupDto);
    if (!result.userData) {
      throw new UnauthorizedException('User creation failed');
    }

    const payload = { sub: result.userData.id, email: result.userData.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    setCookie(res as Response, 'refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return { ...result, accessToken };
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
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(loginDto);
    if (!result?.user) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: result.user.id, email: result.user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    setCookie(res as Response, 'refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return {
      message: result.message,
      user: result.user,
      accessToken,
    };
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
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    let payload: { sub: string; email: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccess = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      { expiresIn: '5m' }
    );
    const newRefresh = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      { expiresIn: '7d' }
    );

    setCookie(res as Response, 'refresh_token', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return { accessToken: newAccess };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'Clears the refresh token cookie and logs out the user.',
  })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'Logged out' };
  }
}
