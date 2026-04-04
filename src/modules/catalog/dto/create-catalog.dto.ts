import { IsOptional, IsString } from 'class-validator';

export class CreateCatalogDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  id?: string;
}
