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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateAccountDto } from './dto/update.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'accounts' };
  }

  @Post('create')
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
  @UseGuards(JwtAuthGuard)
  async getMyAccounts(@CurrentUser() user: { sub: number; email: string }) {
    return this.accountsService.getUserAccountsById(user.sub);
  }

  @Get('user/:userId')
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async deleteAccount(
    @Param('accountId') accountId: number,
    @CurrentUser() user: { sub: number; email: string }
  ) {
    return this.accountsService.deleteAccountById(accountId, user.sub);
  }
}
