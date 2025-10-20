import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType, CurrencyType } from '@prisma/client';

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  balance?: number;

  @IsEnum(CurrencyType)
  @IsOptional()
  currency?: CurrencyType;
}

export class CreateFinAccountDataDto extends CreateAccountDto {
  ownerId: number;
}
