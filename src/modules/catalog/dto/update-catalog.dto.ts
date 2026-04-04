import { IsOptional, IsString } from 'class-validator';

export class UpdateCatalogDto {
  @IsOptional()
  @IsString()
  name?: string;
}
