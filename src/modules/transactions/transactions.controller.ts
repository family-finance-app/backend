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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiUnauthorizedResponse({
  description: 'Unauthorized - Invalid or missing JWT token',
})
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get('all')
  @ApiOperation({
    summary: 'Get all transactions',
    description:
      'Returns all transactions (income, expense, transfers) for the authenticated user.',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(@CurrentUser() user: { sub: number; email: string }) {
    return this.transactionsService.getAllTransactionsByUserId(user.sub);
  }

  @Post('create')
  @ApiOperation({
    summary: 'Create transaction',
    description:
      'Creates a new income or expense transaction linked to a specific account of the authenticated user.',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async createTransaction(
    @Body() createTransaction: CreateTransactionDto,
    @CurrentUser() user: { sub: number; email: string },
  ) {
    const transactionData = { ...createTransaction, userId: user.sub };
    return this.transactionsService.createTransaction(transactionData);
  }

  @Post('transfer')
  @ApiOperation({
    summary: 'Create transfer',
    description:
      'Creates a transfer transaction between two accounts owned by the user.',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async createTransfer(
    @Body() createTransferData: CreateTransferDataDto,
    @CurrentUser() user: { sub: number; email: string },
  ) {
    return this.transactionsService.createTransfer(
      createTransferData,
      user.sub,
    );
  }

  @Put('update')
  @ApiOperation({
    summary: 'Update transaction',
    description:
      'Updates an existing income or expense transaction. Only the transaction owner can update it.',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updateTransaction(
    @Body() updateTransaction: UpdateTransactionDto,
    @CurrentUser() user: { sub: number; email: string },
  ) {
    return this.transactionsService.updateTransaction(
      user.sub,
      updateTransaction,
    );
  }

  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Delete transaction',
    description:
      'Deletes a transaction by ID. Only the transaction owner can delete it.',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async deleteTransaction(
    @Param('id') transactionId: number,
    @CurrentUser() user: { sub: number; email: string },
  ) {
    return this.transactionsService.deleteTransaction(user.sub, transactionId);
  }
}
