import { Controller, Post, Body } from '@nestjs/common';
import { CartService } from '../application/cart.service';
import { Public } from 'src/security/decorators/public.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) { }

  @Public()
  @Post()
  async addItem(@Body() body: any) {
    try {
      return await this.service.addItem(
        body.customerId,
        body.productId,
        body.quantity,
        body.basePrice
      );
    } catch (e) {
      console.error(e);
      throw e;
    }
  }


}
