//name, type, currency, descr?

import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType, CurrencyType } from '@prisma/client';

export class UpdateAccountDto {
  @IsString()
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsEnum(CurrencyType)
  currency: CurrencyType;
}
