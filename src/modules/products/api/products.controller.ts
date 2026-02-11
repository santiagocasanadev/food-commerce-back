import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ProductsService } from '../application/products.service';
import { Public } from 'src/security/decorators/public.decorator';

@Controller('products')
export class ProductsController {
    constructor(private readonly service: ProductsService) { }

    @Public()
    @Get()
    list() {
        return this.service.list();
    }

    @Public()
    @Get(':productId')
    async get(@Param('productId') productId: string) {
        const product = await this.service.getById(productId);
        if (!product) {
            throw new NotFoundException();
        }
        return product;
    }
}
