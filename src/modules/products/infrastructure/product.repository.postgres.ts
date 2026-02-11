import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { PoolClient } from 'pg';
import { ProductMapper } from '../../../infrastructure/mappers/product.mapper';
import { ProductsRepository } from '../domain/products.repository';
import { Product } from '../domain/products.entity';

export class PostgresProductRepository implements ProductsRepository {

  async findAll(client?: PoolClient): Promise<Product[]> {

    const executor = client ?? getPgPool();

    const { rows } = await executor.query(`SELECT * FROM products`);

    return rows.map(ProductMapper.toDomain);
  }

  async findById(id: string, client?: PoolClient): Promise<Product | null> {

    const executor = client ?? getPgPool();

    const { rows } = await executor.query(
      `SELECT * FROM products WHERE id=$1`,
      [id]
    );

    if (!rows.length) return null;

    return ProductMapper.toDomain(rows[0]);
  }

  async save(product: Product, client?: PoolClient): Promise<void> {

    const executor = client ?? getPgPool();
    const data = ProductMapper.toPersistence(product);

    await executor.query(
      `
      INSERT INTO products
      (id,name,description,base_price,active,catalog_id)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT(id)
      DO UPDATE SET
        name=$2,
        description=$3,
        base_price=$4,
        active=$5,
        catalog_id=$6
      `,
      [
        data.id,
        data.name,
        data.description,
        data.base_price,
        data.active,
        data.catalog_id
      ]
    );
  }
}
