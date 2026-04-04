import { IsInt, Min } from 'class-validator';

export class SetInventoryDto {
  @IsInt()
  @Min(0)
  availableQuantity!: number;

  @IsInt()
  @Min(0)
  reservedQuantity!: number;
}
