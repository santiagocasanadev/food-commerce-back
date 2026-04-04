import { PoolClient } from 'pg';
import { Inventory } from './inventory.entity';

export interface InventoryRepository {
  findByProductId(productId: string, client?: PoolClient): Promise<Inventory | null>;
  save(inventory: Inventory, client?: PoolClient): Promise<void>;
  reserve(productId: string, quantity: number, client: PoolClient): Promise<void>;
  adjust(productId: string, quantity: number, client?: PoolClient): Promise<void>;
}
