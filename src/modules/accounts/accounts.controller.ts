import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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
}
