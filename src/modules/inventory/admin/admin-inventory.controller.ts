import { Body, Controller, Get, Param, Patch, Put, UseGuards, UseInterceptors } from "@nestjs/common";
import { InventoryService } from "../application/inventory.service";
import { TENANT_BACKOFFICE_ROLES } from "src/security/roles.enum";
import { RolesGuard } from "src/security/guards/roles.guard";
import { Roles } from "src/security/decorators/roles.decorator";
import { AuditInterceptor } from "src/infrastructure/logging/audit.interceptor";
import { AdjustInventoryDto } from "../dto/adjust-inventory.dto";
import { SetInventoryDto } from "../dto/set-inventory.dto";

@UseInterceptors(AuditInterceptor)
@UseGuards(RolesGuard)
@Roles(...TENANT_BACKOFFICE_ROLES)
@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly service: InventoryService) { }

  @Get(':productId')
  async get(@Param('productId') productId: string) {
    const inventory = await this.service.getOrFail(productId);
    return {
      productId,
      availableQuantity: inventory.getAvailable(),
      reservedQuantity: inventory.getReserved()
    };
  }

  @Put(':productId')
  async set(
    @Param('productId') productId: string,
    @Body() dto: SetInventoryDto
  ) {
    const inventory = await this.service.set(productId, dto);
    return {
      productId,
      availableQuantity: inventory.getAvailable(),
      reservedQuantity: inventory.getReserved()
    };
  }

  @Patch(':productId/adjust')
  async adjust(
    @Param('productId') productId: string,
    @Body() dto: AdjustInventoryDto
  ) {
    const inventory = await this.service.adjust(productId, dto.quantity);
    return {
      productId,
      availableQuantity: inventory.getAvailable(),
      reservedQuantity: inventory.getReserved()
    };
  }
}
