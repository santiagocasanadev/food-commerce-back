import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePlatformTenantDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  dbConnectionUrl?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
