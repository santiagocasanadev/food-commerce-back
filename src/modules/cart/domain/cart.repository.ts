import { PoolClient } from 'pg';
import { Cart } from './cart.entity';

export interface CartRepository {
  findActiveByCustomer(customerId: string, client?:PoolClient): Promise<Cart | null>;
  findActiveByGuest(guestId: string, client?: PoolClient): Promise<Cart | null>;
  save(cart: Cart, client?:PoolClient): Promise<void>;
  delete(cartId: string, client?: PoolClient): Promise<void>;
  clearItems(cartId: string, client?: PoolClient): Promise<void>;
}
