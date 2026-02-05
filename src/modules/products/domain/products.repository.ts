import { PoolClient } from 'pg';
import { Product } from './products.entity';

export interface ProductsRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  save(product: Product, client?:PoolClient): Promise<void>;
}
