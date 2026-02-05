import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ProductsService } from '../application/products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly service: ProductsService) { }

    @Get()
    list() {
        return this.service.list();
    }

    @Get(':productId')
    async get(@Param('productId') productId: string) {
        const product = await this.service.getById(productId);
        if (!product) {
            throw new NotFoundException();
        }
        return product;
    }
}
