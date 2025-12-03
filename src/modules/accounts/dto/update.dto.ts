//name, type, currency, descr?

import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType, CurrencyType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty()
  @IsEnum(CurrencyType)
  currency: CurrencyType;
}
