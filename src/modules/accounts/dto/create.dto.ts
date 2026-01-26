import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType, CurrencyType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  @IsNotEmpty()
  type: AccountType;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  balance?: number;

  @ApiProperty({ required: true, enum: CurrencyType })
  @IsEnum(CurrencyType)
  @IsNotEmpty()
  currency: CurrencyType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  groupId?: number;
}

export class CreateFinAccountDataDto extends CreateAccountDto {
  ownerId: number;
}
