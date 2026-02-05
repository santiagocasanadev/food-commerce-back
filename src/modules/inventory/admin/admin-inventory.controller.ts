import { Body, Controller, Get, NotFoundException, Param, Patch } from "@nestjs/common";
import { InventoryService } from "../application/inventory.service";

@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly service: InventoryService) { }

  @Get(':productId')
  async get(@Param('productId') productId: string) {
    const inventory = await this.service.get(productId);
    if (!inventory) throw new NotFoundException();
    return {
      productId,
      availableQuantity: inventory.getAvailable(),
      reservedQuantity: inventory['reservedQuantity'] ?? 0
    };
  }


  @Patch(':productId/adjust')
  adjust(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number
  ) {
    return this.service.adjust(productId, quantity);
  }
}
