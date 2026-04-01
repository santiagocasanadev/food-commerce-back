import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Role } from 'src/security/roles.enum';

export class CreateUserDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsString()
  birthDate?: string | null;

  @IsOptional()
  @IsString()
  gender?: string | null;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
