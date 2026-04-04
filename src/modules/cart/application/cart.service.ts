import type { CartRepository } from "../domain/cart.repository";
import { Cart } from "../domain/cart.entity";
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { CartItem } from "../domain/cart-item.entity";
import type { ProductsRepository } from "src/modules/products/domain/products.repository";

@Injectable()
export class CartService {

  private readonly logger = new Logger(CartService.name);

  constructor(
    @Inject('CartRepository')
    private readonly repository: CartRepository,
    @Inject('ProductsRepository')
    private readonly productsRepository: ProductsRepository,
  ) { }

  async addItem(
    customerId: string | null,
    guestId: string | null,
    productId: string,
    quantity: number
  ): Promise<Cart> {

    if (!customerId && !guestId) {
      throw new BadRequestException('customerId o guestId requerido');
    }

    this.logger.debug(
      `Adding item -> product:${productId} qty:${quantity} customer:${customerId} guest:${guestId}`
    );

    try {
      const product = await this.productsRepository.findById(productId);

      if (!product || !product.getStatus()) {
        throw new BadRequestException('Product not found or inactive');
      }

      const cart = await this.getOrCreateCart(customerId, guestId);
      cart.addItem(
        new CartItem(productId, quantity, product.getBasePrice())
      );
      await this.repository.save(cart);
      this.logger.log(`Item added to cart ${cart.id}`);
      return cart;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Error adding item to cart`, error.stack);

      throw new InternalServerErrorException('Could not add item to cart');
    }
  }

  async getActiveCart(
    customerId: string
  ): Promise<Cart | null> {

    this.logger.debug(`Fetching active cart for customer ${customerId}`);

    return this.repository.findActiveByCustomer(customerId);
  }

  async mergeCart(
    guestId: string, 
    customerId: string
  ): Promise<Cart> {

    this.logger.debug(
      `Merging carts -> guest:${guestId} customer:${customerId}`
    );

    const guestCart = await this.repository.findActiveByGuest(guestId);

    if (!guestCart) {
      throw new BadRequestException('No active cart for guest');
    }

    let userCart =
      await this.repository.findActiveByCustomer(customerId);

    if (!userCart) {
      guestCart.assignCustomer(customerId);
      await this.repository.save(guestCart);

      return guestCart;
    }

    userCart.merge(guestCart);

    await this.repository.save(userCart);

    await this.repository.delete(guestCart.id);

    return userCart;
  }

  async clearCart(
    customerId: string | null, 
    guestId: string | null
  ): Promise<void> {

    const cart = await this.getCart(customerId, guestId);

    if (!cart) return;

    this.logger.debug(`Clearing cart ${cart.id}`);

    cart.clear();

    await this.repository.clearItems(cart.id);
  }

  // -------------------------
  // Private helpers
  // -------------------------

  private async getCart(
    customerId: string | null,
    guestId: string | null
  ): Promise<Cart | null> {

    if (customerId) {
      const cart =
        await this.repository.findActiveByCustomer(customerId);

      if (cart) return cart;
    }

    if (guestId) {
      return this.repository.findActiveByGuest(guestId);
    }

    return null;
  }

  private async getOrCreateCart(
    customerId: string | null,
    guestId: string | null
  ): Promise<Cart> {

    let cart = await this.getCart(customerId, guestId);

    if (!cart) {

      cart = new Cart(
        crypto.randomUUID(),
        customerId ?? null,
        guestId ?? null,
        'ACTIVE'
      );

      this.logger.debug(`Creating new cart ${cart.id}`);
    }

    return cart;
  }
}
