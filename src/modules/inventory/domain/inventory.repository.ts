import { PoolClient } from 'pg';
import { Inventory } from './inventory.entity';

export interface InventoryRepository {
  findByProductId(productId: string): Promise<Inventory | null>;
  save(inventory: Inventory, client?:PoolClient): Promise<void>;
}
