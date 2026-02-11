import { Body, Controller, Get, Param, Patch, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductsService } from "../application/products.service";
import { Role } from "src/security/roles.enum";
import { RolesGuard } from "src/security/guards/roles.guard";
import { Roles } from "src/security/decorators/roles.decorator";
import { AuditInterceptor } from "src/infrastructure/logging/audit.interceptor";

@UseInterceptors(AuditInterceptor)
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly service: ProductsService) { }

  @Get()
  list() {
    return this.service.listAdmin();
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }

  @Patch(':id/price')
  changePrice(@Param('id') id: string, @Body('price') price: number) {
    return this.service.changePrice(id, price);
  }
}
