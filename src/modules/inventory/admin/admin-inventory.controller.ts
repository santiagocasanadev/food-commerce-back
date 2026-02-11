import { Body, Controller, Get, NotFoundException, Param, Patch, UseGuards, UseInterceptors } from "@nestjs/common";
import { InventoryService } from "../application/inventory.service";
import { Role } from "src/security/roles.enum";
import { RolesGuard } from "src/security/guards/roles.guard";
import { Roles } from "src/security/decorators/roles.decorator";
import { AuditInterceptor } from "src/infrastructure/logging/audit.interceptor";

@UseInterceptors(AuditInterceptor)
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
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
