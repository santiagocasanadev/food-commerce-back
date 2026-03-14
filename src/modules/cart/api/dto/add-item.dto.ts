import { IsString, IsInt, Min, IsNumber } from 'class-validator';

export class AddItemDto {

  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  basePrice: number;
}