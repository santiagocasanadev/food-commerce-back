import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { CatalogService } from "../application/catalog.service";
import { TENANT_BACKOFFICE_ROLES } from "src/security/roles.enum";
import { RolesGuard } from "src/security/guards/roles.guard";
import { Roles } from "src/security/decorators/roles.decorator";
import { AuditInterceptor } from "src/infrastructure/logging/audit.interceptor";
import { CreateCatalogDto } from "../dto/create-catalog.dto";
import { UpdateCatalogDto } from "../dto/update-catalog.dto";

@UseInterceptors(AuditInterceptor)
@UseGuards(RolesGuard)
@Roles(...TENANT_BACKOFFICE_ROLES)
@Controller('admin/catalogs')
export class AdminCatalogController {
  constructor(private readonly service: CatalogService) { }

  @Get()
  list() {
    return this.service.listAdmin();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(@Body() dto: CreateCatalogDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCatalogDto) {
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
