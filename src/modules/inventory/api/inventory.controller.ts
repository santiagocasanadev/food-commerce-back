import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InventoryService } from '../application/inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get(':productId')
  async get(@Param('productId') productId: string) {
    const inventory = await this.service.get(productId);
    if (!inventory) {
      throw new NotFoundException();
    }
    return {
      productId,
      availableQuantity: inventory.getAvailable(),
      reservedQuantity: 0
    };
  }
}
