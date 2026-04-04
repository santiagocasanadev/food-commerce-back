import { IsEmail, IsEnum, IsString, MinLength, ValidateIf } from 'class-validator';
import { AuthProvider } from '../domain/authProviders';

export enum LoginType {
  EMAIL = 'email',
  SOCIAL = 'social',
}

export class LoginDto {
  @IsEnum(LoginType)
  type!: LoginType;

  @ValidateIf((dto: LoginDto) => dto.type === LoginType.EMAIL)
  @IsEmail()
  email?: string;

  @ValidateIf((dto: LoginDto) => dto.type === LoginType.EMAIL)
  @IsString()
  @MinLength(8)
  password?: string;

  @ValidateIf((dto: LoginDto) => dto.type === LoginType.SOCIAL)
  @IsEnum(AuthProvider)
  provider?: AuthProvider;

  @ValidateIf((dto: LoginDto) => dto.type === LoginType.SOCIAL)
  @IsString()
  token?: string;
}
