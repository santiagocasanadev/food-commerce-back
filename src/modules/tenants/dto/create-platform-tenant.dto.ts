import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreatePlatformTenantDto {
  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsString()
  dbConnectionUrl!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
