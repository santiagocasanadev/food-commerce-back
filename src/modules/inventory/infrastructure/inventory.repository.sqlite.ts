import { InventoryRepository } from '../domain/inventory.repository';
import { Inventory } from '../domain/inventory.entity';
import { sqliteDb } from '../../../infrastructure/database/sqlite.connection';

export class SqliteInventoryRepository {

  async findByProductId(productId: string): Promise<Inventory | null> {
    const r = sqliteDb.prepare(`
      SELECT product_id, available_quantity, reserved_quantity
      FROM inventory WHERE product_id = ?
    `).get(productId);

    return r
      ? new Inventory(r.product_id, r.available_quantity, r.reserved_quantity)
      : null;
  }

  async save(inv: Inventory): Promise<void> {
    sqliteDb.prepare(`
      INSERT INTO inventory (product_id, available_quantity, reserved_quantity)
      VALUES (?, ?, ?)
      ON CONFLICT(product_id) DO UPDATE SET
        available_quantity = excluded.available_quantity,
        reserved_quantity = excluded.reserved_quantity
    `).run(inv['productId'], inv.getAvailable(), inv['reservedQuantity'] ?? 0);
  }
}
