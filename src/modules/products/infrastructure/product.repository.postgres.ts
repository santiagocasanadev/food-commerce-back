import { PoolClient } from 'pg';
import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { Product } from '../domain/products.entity';
import { ProductsRepository } from '../domain/products.repository';

export class PostgresProductRepository implements ProductsRepository {

  async findAll(): Promise<Product[]> {
    const { rows } = await getPgPool().query(`
      SELECT id, name, description, base_price, active, catalog_id
      FROM products
    `);

    return rows.map(r =>
      new Product(
        r.id,
        r.name,
        r.description,
        Number(r.base_price),
        r.active,
        r.catalog_id
      )
    );
  }

  async findById(id: string): Promise<Product | null> {
    const { rows } = await getPgPool().query(
      `
      SELECT id, name, description, base_price, active, catalog_id
      FROM products WHERE id = $1
      `,
      [id]
    );

    const r = rows[0];
    return r
      ? new Product(r.id, r.name, r.description, Number(r.base_price), r.active, r.catalog_id)
      : null;
  }

  async save(product: Product, client?:PoolClient): Promise<void> {
    await getPgPool().query(
      `
      INSERT INTO products (id, name, description, base_price, active, catalog_id)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (id)
      DO UPDATE SET
        name = $2,
        description = $3,
        base_price = $4,
        active = $5,
        catalog_id = $6
      `,
      [
        product.id,
        product.name,
        product.description,
        product.getPrice(),
        product.isActive(),
        product.catalogId
      ]
    );
  }
}
