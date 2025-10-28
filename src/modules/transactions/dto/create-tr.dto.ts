import {
  IsNumber,
  IsOptional,
  Min,
  IsISO8601,
  IsEnum,
  IsString,
} from 'class-validator';

import { TransactionType, CurrencyType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTransactionDataDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @Min(0.01)
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString()
  date?: string;
}

export class CreateTransactionDto extends CreateTransactionDataDto {
  @IsNumber()
  @Type(() => Number)
  accountId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  groupId?: number;

  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsEnum(CurrencyType)
  currency: CurrencyType;
}
