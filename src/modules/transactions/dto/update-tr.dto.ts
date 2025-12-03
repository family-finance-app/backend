import { IsNumber, IsOptional, Min, IsEnum, IsString } from 'class-validator';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTransactionDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  id: number;

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
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  date?: string;
}
