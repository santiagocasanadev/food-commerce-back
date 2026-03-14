import { IsInt, Min, IsOptional } from 'class-validator';

export class CreateOrderDto {

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsToUse?: number;
}