import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ required: true })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'New password must contain at least 8 characters' })
  password: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  terms: true;

  @IsString()
  @IsOptional()
  role?: string;
}
