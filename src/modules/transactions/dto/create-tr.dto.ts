import { IsNumber, IsOptional, Min, IsEnum, IsString } from 'class-validator';
import { CurrencyType, TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDataDto {
  @ApiProperty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  date?: string;
}

export class CreateTransactionDto extends CreateTransactionDataDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  accountId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  groupId?: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @ApiProperty()
  @IsEnum(CurrencyType)
  currency: CurrencyType;
}
