import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from '../application/cart.service';
import { Public } from 'src/security/decorators/public.decorator';
import { JwtAuthGuard } from 'src/security/guards/jwt-auth.guard';
import { AddItemDto } from './dto/add-item.dto';
import { OptionalJwtAuthGuard } from 'src/security/guards/optional-jwt-auth.guard';
import { Roles } from 'src/security/decorators/roles.decorator';
import { RolesGuard } from 'src/security/guards/roles.guard';
import { Role } from 'src/security/roles.enum';

@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) { }
  private readonly logger = new Logger(CartController.name);

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async addItem(@Req() req, @Body() dto: AddItemDto) {
    this.ensureCustomerOrGuest(req.user);

    const customerId = req.user?.customerId ?? null;
    const guestId = req.headers['x-guest-id'] ?? null;

    return this.service.addItem(
      customerId,
      guestId,
      dto.productId,
      dto.quantity
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get()
  async getActiveCart(@Req() req) {
    const cart = await this.service.getActiveCart(req.user.customerId);

    if (!cart) {
      throw new BadRequestException('No active cart')
    };

    return {
      id: cart.id,
      customerId: cart.getCustomerId(),
      status: cart.getStatus(),
      items: cart.getItems()
    };
  }

  @Public()
  @Delete()
  async clearCart(@Req() req) {
    this.ensureCustomerOrGuest(req.user);

    const customerId = req.user?.customerId ?? null;
    const guestId = req.headers['x-guest-id'] ?? null;

    await this.service.clearCart(customerId, guestId);

    return { success: true };
  }

  private ensureCustomerOrGuest(user?: { role?: Role } | null) {
    if (user && user.role !== Role.CUSTOMER) {
      throw new ForbiddenException('This operation is only available for customers');
    }
  }

}
