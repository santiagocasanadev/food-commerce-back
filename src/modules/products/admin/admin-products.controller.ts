import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ProductsService } from "../application/products.service";

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

  @Patch(':id/desactivate')
  desactivate(@Param('id') id: string) {
    return this.service.desactivate(id);
  }

  @Patch(':id/price')
  changePrice(@Param('id') id: string, @Body('price') price: number) {
    return this.service.changePrice(id, price);
  }
}
