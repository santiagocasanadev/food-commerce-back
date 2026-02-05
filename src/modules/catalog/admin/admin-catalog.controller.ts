import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { CatalogService } from "../application/catalog.service";

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

  @Patch(':id/desactivate')
  desactivate(@Param('id') id: string) {
    return this.service.desactivate(id);
  }
}
