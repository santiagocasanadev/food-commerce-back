import { Body, Controller, Get, Param, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { CatalogService } from "../application/catalog.service";
import { Role } from "src/security/roles.enum";
import { RolesGuard } from "src/security/guards/roles.guard";
import { Roles } from "src/security/decorators/roles.decorator";
import { AuditInterceptor } from "src/infrastructure/logging/audit.interceptor";

@UseInterceptors(AuditInterceptor)
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/catalogs')
export class AdminCatalogController {
  constructor(private readonly service: CatalogService) { }

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body('id') id: string, @Body('name') name: string) {
    return this.service.create(id, name);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
