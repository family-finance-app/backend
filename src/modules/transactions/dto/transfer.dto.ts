import { IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { CurrencyType, TransactionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDataDto {
  @ApiProperty()
  @IsNumber()
  accountId: number;

  @ApiProperty()
  @IsNumber()
  accountRecipientId: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty()
  @IsEnum(CurrencyType)
  currency: CurrencyType;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  groupId?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty()
  @IsNumber()
  categoryId: number;
}

export class UpdateTransferDataDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  date?: string;
}
