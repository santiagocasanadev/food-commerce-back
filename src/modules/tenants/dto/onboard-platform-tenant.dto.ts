import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class OnboardPlatformTenantDto {
  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsString()
  dbConnectionUrl!: string;

  @IsEmail()
  adminEmail!: string;

  @IsString()
  adminName!: string;

  @IsString()
  @MinLength(8)
  adminPassword!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
