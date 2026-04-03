import { IsString } from 'class-validator';

export class TestPlatformTenantConnectionDto {
  @IsString()
  dbConnectionUrl!: string;
}
