import { IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { CurrencyType, TransactionType } from '@prisma/client';

export class CreateTransferDataDto {
  @IsNumber()
  accountId: number;

  @IsNumber()
  accountRecipientId: number;

  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsEnum(CurrencyType)
  currency: CurrencyType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  groupId?: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsNumber()
  categoryId: number;
}

export class UpdateTransferDataDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  date?: string;
}
