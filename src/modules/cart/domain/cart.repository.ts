import { PoolClient } from 'pg';
import { Cart } from './cart.entity';

export interface CartRepository {
  findActiveByCustomer(customerId: string, client?:PoolClient): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
}
