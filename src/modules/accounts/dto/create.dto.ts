import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType, CurrencyType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  balance?: number;

  @ApiProperty({ required: false, enum: CurrencyType })
  @IsEnum(CurrencyType)
  @IsOptional()
  currency?: CurrencyType;
}

export class CreateFinAccountDataDto extends CreateAccountDto {
  ownerId: number;
}
