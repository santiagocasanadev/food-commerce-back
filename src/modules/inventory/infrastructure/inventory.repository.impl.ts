import { InventoryRepository } from '../domain/inventory.repository';
import { Inventory } from '../domain/inventory.entity';

export class InMemoryInventoryRepository {
  private readonly store = new Map<string, Inventory>([
    ['p1', new Inventory('p1', 10, 0)],
    ['p2', new Inventory('p2', 5, 0)],
  ]);

  async findByProductId(productId: string): Promise<Inventory | null> {
    return this.store.get(productId) ?? null;
  }

  async save(inventory: Inventory): Promise<void> {
    this.store.set(inventory['productId'], inventory);
  }
}
