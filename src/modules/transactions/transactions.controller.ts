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
import { TransactionsService } from './transactions.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateTransactionDto } from './dto/create-tr.dto.js';
import { UpdateTransactionDto } from './dto/update-tr.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { CreateTransferDataDto } from './dto/transfer.dto.js';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get('health') // all endpoints except this require authentication
  health() {
    return { status: 'ok', module: 'transactions' };
  }

  @Get('all') // get all transactions of a user
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(@CurrentUser() user: { sub: number; email: string }) {
    return this.transactionsService.getUserTransactionsById(user.sub);
  }

  @Post('create') // create income/expense transaction
  @UseGuards(JwtAuthGuard)
  async createTransaction(
    @Body() createTransaction: CreateTransactionDto,
    @CurrentUser() user: { sub: number; email: string }
  ) {
    const transactionData = { ...createTransaction, userId: user.sub };
    return this.transactionsService.createTransaction(transactionData);
  }

  @Post('transfer') // create transfer transaction
  @UseGuards(JwtAuthGuard)
  async createTransfer(
    @Body() createTransferData: CreateTransferDataDto,
    @CurrentUser() user: { sub: number; email: string }
  ) {
    return this.transactionsService.createTransfer(
      createTransferData,
      user.sub
    );
  }

  @Put('update') // update income/expense transaction
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

  @Delete('delete/:id') // delete income/expense transaction
  @UseGuards(JwtAuthGuard)
  async deleteTransaction(
    @Param('id') transactionId: number,
    @CurrentUser() user: { sub: number; email: string }
  ) {
    return this.transactionsService.deleteTransaction(user.sub, transactionId);
  }
}
