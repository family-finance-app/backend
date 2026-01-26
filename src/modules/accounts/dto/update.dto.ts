import { IsString, IsEnum } from 'class-validator';
import { AccountType, CurrencyType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({ enum: CurrencyType })
  @IsEnum(CurrencyType)
  currency: CurrencyType;
}
