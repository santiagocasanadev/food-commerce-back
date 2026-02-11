import type { InventoryRepository } from '../domain/inventory.repository';
import { Inventory } from '../domain/inventory.entity';
import { Inject } from '@nestjs/common';

export class InventoryService {
  constructor(
    @Inject('InventoryRepository')
    private readonly repository: InventoryRepository
  ) {}

  async get(productId: string): Promise<Inventory | null> {
    return this.repository.findByProductId(productId);
  }

  async canReserve(productId: string, quantity: number): Promise<boolean> {
    const inventory = await this.repository.findByProductId(productId);
    if (!inventory) return false;
    return inventory.canReserve(quantity);
  }

  async adjust(productId: string, quantity: number): Promise<void> {
    await this.repository.adjust(productId, quantity);
  }
}
