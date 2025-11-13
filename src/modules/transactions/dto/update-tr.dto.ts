import { IsNumber, IsOptional, Min, IsEnum, IsString } from 'class-validator';
import { TransactionType, CurrencyType, Category } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateTransactionDto {
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @Min(0.01)
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString()
  date?: string;
}
