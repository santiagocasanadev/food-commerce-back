import { sqliteDb } from '../../../infrastructure/database/sqlite.connection';
import { Product } from '../domain/products.entity';
import { ProductsRepository } from '../domain/products.repository';

export class SqliteProductRepository implements ProductsRepository {

  async findAll(): Promise<Product[]> {
    const rows = sqliteDb.prepare(`
      SELECT id, name, description, base_price, active, catalog_id
      FROM products
    `).all();
    return rows.map(r =>
      new Product(r.id, r.name, r.description, r.base_price, !!r.active, r.catalog_id)
    );
  }

  async findById(id: string): Promise<Product | null> {
    const r = sqliteDb.prepare(`
      SELECT id, name, description, base_price, active, catalog_id
      FROM products WHERE id = ?
    `).get(id);
    return r
      ? new Product(r.id, r.name, r.description, r.base_price, !!r.active, r.catalog_id)
      : null;
  }

  async save(p: Product): Promise<void> {
    sqliteDb.prepare(`
      INSERT INTO products (id, name, description, base_price, active, catalog_id)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        base_price = excluded.base_price,
        active = excluded.active,
        catalog_id = excluded.catalog_id
    `).run(
      p.id, p.name, p.description, p.getBasePrice(), p.getStatus() ? 1 : 0, p.catalogId
    );
  }
}
