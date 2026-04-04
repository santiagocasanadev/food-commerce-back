import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductsService } from "../application/products.service";
import { TENANT_BACKOFFICE_ROLES } from "src/security/roles.enum";
import { RolesGuard } from "src/security/guards/roles.guard";
import { Roles } from "src/security/decorators/roles.decorator";
import { AuditInterceptor } from "src/infrastructure/logging/audit.interceptor";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";

@UseInterceptors(AuditInterceptor)
@UseGuards(RolesGuard)
@Roles(...TENANT_BACKOFFICE_ROLES)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly service: ProductsService) { }

  @Get()
  list() {
    return this.service.listAdmin();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
