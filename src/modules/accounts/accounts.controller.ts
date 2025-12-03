import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Param,
  UnauthorizedException,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import { CreateAccountDto } from './dto/create.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UpdateAccountDto } from './dto/update.dto.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiUnauthorizedResponse({
  description: 'Unauthorized - Invalid or missing JWT token',
})
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Create account',
    description:
      'Creates a new financial account (bank, cash, card, etc.) for the authenticated user.',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async createAccount(
    @Body() createAccountDto: CreateAccountDto,
    @CurrentUser() user: { sub: number; email: string }
  ) {
    const accountData = {
      ...createAccountDto,
      ownerId: user.sub,
    };
    return this.accountsService.createFinAccount(accountData);
  }

  @Get('my')
  @ApiOperation({
    summary: 'Get my accounts',
    description:
      'Returns all financial accounts belonging to the authenticated user.',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getMyAccounts(@CurrentUser() user: { sub: number; email: string }) {
    return this.accountsService.getUserAccountsById(user.sub);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user accounts by ID',
    description:
      'Returns accounts for a specific user. Users can only access their own accounts.',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getUserAccounts(
    @Param('userId') userId: string,
    @CurrentUser() user: { sub: number; email: string }
  ) {
    const userIdNumber = parseInt(userId, 10);
    if (userIdNumber !== user.sub) {
      throw new UnauthorizedException('You can only access your own accounts');
    }

    return this.accountsService.getUserAccountsById(userIdNumber);
  }

  @Put(':accountId')
  @ApiOperation({
    summary: 'Update account',
    description:
      'Updates an existing financial account. Only the account owner can update it.',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updateAccountById(
    @Body() accountData: UpdateAccountDto,
    @Param('accountId') accountId: number,
    @CurrentUser() user: { sub: number; email: string }
  ) {
    return this.accountsService.updateAccountById(
      accountId,
      user.sub,
      accountData
    );
  }

  @Delete(':accountId')
  @ApiOperation({
    summary: 'Delete account',
    description:
      'Deletes a financial account and all associated transactions. Only the account owner can delete it.',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async deleteAccount(
    @Param('accountId') accountId: number,
    @CurrentUser() user: { sub: number; email: string }
  ) {
    return this.accountsService.deleteAccountById(accountId, user.sub);
  }
}
