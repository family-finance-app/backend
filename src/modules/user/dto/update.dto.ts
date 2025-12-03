import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  birthdate: string;
}

@ValidatorConstraint({ name: 'passwordsDontMatch', async: false })
export class PasswordsDontMatchConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, validationArguments: ValidationArguments): boolean {
    const [relatedPropertyName] = validationArguments.constraints;
    const relatedValue = (validationArguments.object as any)[
      relatedPropertyName
    ];
    return value !== relatedValue;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'New password should differ';
  }
}

export class UpdateUserPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'New password must contain at least 8 characters' })
  @Validate(PasswordsDontMatchConstraint, ['oldPassword'])
  newPassword: string;
}

export class UpdateUserEmailDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}
