import type { InventoryRepository } from '../domain/inventory.repository';
import { Inventory } from '../domain/inventory.entity';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ProductsRepository } from 'src/modules/products/domain/products.repository';

@Injectable()
export class InventoryService {
  constructor(
    @Inject('InventoryRepository')
    private readonly repository: InventoryRepository,
    @Inject('ProductsRepository')
    private readonly productsRepository: ProductsRepository,
  ) {}

  async get(productId: string): Promise<Inventory | null> {
    return this.repository.findByProductId(productId);
  }

  async canReserve(productId: string, quantity: number): Promise<boolean> {
    if (quantity < 0) {
      throw new BadRequestException('Quantity must be zero or greater');
    }

    const inventory = await this.repository.findByProductId(productId);
    if (!inventory){
      throw new NotFoundException(`Inventory not found for product ${productId}`);
    }
    return inventory.canReserve(quantity);
  }

  async set(
    productId: string,
    input: { availableQuantity: number; reservedQuantity: number },
  ) {
    await this.assertProductExists(productId);

    const inventory = new Inventory(
      productId,
      input.availableQuantity,
      input.reservedQuantity,
    );

    await this.repository.save(inventory);
    return inventory;
  }

  async adjust(productId: string, quantity: number) {
    await this.assertProductExists(productId);

    if (!Number.isInteger(quantity)) {
      throw new BadRequestException('Quantity must be an integer');
    }

    const current = await this.repository.findByProductId(productId);

    if (!current) {
      throw new NotFoundException(`Inventory not found for product ${productId}`);
    }

    try {
      await this.repository.adjust(productId, quantity);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Inventory cannot be negative') {
        throw new BadRequestException('Inventory cannot be negative');
      }
      throw error;
    }

    return this.getOrFail(productId);
  }

  async getOrFail(productId: string) {
    const inventory = await this.repository.findByProductId(productId);
    if (!inventory) {
      throw new NotFoundException(`Inventory not found for product ${productId}`);
    }
    return inventory;
  }

  private async assertProductExists(productId: string) {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw new BadRequestException('Product not found for inventory');
    }
  }
}
