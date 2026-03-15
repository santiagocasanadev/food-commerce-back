import { Controller, Post, Body, UseGuards, Get, Req, Logger, BadRequestException, Delete } from '@nestjs/common';
import { CartService } from '../application/cart.service';
import { Public } from 'src/security/decorators/public.decorator';
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard';
import { AddItemDto } from './dto/add-item.dto';
import { OptionalJwtAuthGuard } from 'src/security/guards/optional-jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) { }
  private readonly logger = new Logger(CartController.name);

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async addItem(@Req() req, @Body() dto: AddItemDto) {

    const customerId = req.user?.id ?? null;
    const guestId = req.headers['x-guest-id'] ?? null;

    return this.service.addItem(
      customerId,
      guestId,
      dto.productId,
      dto.quantity,
      dto.basePrice
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getActiveCart(@Req() req) {
    const cart = await this.service.getActiveCart(req.user.id);

    if (!cart) {
      throw new BadRequestException('No active cart')
    };

    return {
      id: cart.id,
      customerId: cart.getCustomerId,
      status: cart.getStatus(),
      items: cart.getItems()
    };
  }

  @Public()
  @Delete()
  async clearCart(@Req() req) {

    const customerId = req.user?.id ?? null;
    const guestId = req.headers['x-guest-id'] ?? null;

    await this.service.clearCart(customerId, guestId);

    return { success: true };
  }

}
