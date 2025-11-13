import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Body,
  Param,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-tr.dto';
import { UpdateTransactionDto } from './dto/update-tr.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'transactions' };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createTransaction(
    @Body() createTransaction: CreateTransactionDto,
    @CurrentUser() user: { sub: number; email: string }
  ) {
    const transactionData = { ...createTransaction, userId: user.sub };
    console.log(transactionData);
    return this.transactionsService.createTransaction(transactionData);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(@CurrentUser() user: { sub: number; email: string }) {
    return this.transactionsService.getUserTransactionsById(user.sub);
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateTransaction(
    @Body() updateTransaction: UpdateTransactionDto,
    @CurrentUser() user: { sub: number; email: string }
  ) {
    return this.transactionsService.updateTransaction(
      user.sub,
      updateTransaction
    );
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteTransaction(
    @Param('id') transactionId: number,
    @CurrentUser() user: { sub: number; email: string }
  ) {
    return this.transactionsService.deleteTransaction(user.sub, transactionId);
  }
}
