import { Cart } from "../domain/cart.entity";
import { CartRepository } from "../domain/cart.repository";


export class InMemoryCartRepository implements CartRepository {
  private readonly carts = new Map<string, Cart>();

  async findActiveByCustomer(customerId: string): Promise<Cart | null> {
    for (const cart of this.carts.values()) {
      if (cart['customerId'] === customerId && cart['status'] === 'ACTIVE') {
        return cart;
      }
    }
    return null;
  }

  async save(cart: Cart): Promise<void> {
    this.carts.set(cart['id'], cart);
  }
}
