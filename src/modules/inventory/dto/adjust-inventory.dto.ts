import { IsInt } from 'class-validator';

export class AdjustInventoryDto {
  @IsInt()
  quantity!: number;
}
