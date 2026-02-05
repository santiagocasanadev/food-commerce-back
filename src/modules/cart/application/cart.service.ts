import { PricingService } from "src/modules/pricing/application/pricing.service";
import type { CartRepository } from "../domain/cart.repository";
import { Cart } from "../domain/cart.entity";
import { CartItem } from "../domain/cart-item.entity";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CartService {
  constructor(
    @Inject('CartRepository')
    private readonly repository: CartRepository,
    private readonly pricingService: PricingService
  ) {}

  async addItem(
    customerId: string,
    productId: string,
    quantity: number,
    basePrice: number,
  ): Promise<Cart> {
    let cart = await this.repository.findActiveByCustomer(customerId);

    if (!cart) {
      cart = new Cart(
        crypto.randomUUID(),
        customerId,
        'ACTIVE'
      );
    }

    cart.addItem(
      new CartItem(
        productId,
        quantity,
        basePrice
      )
    );

    await this.repository.save(cart);
    return cart;
  }
}
