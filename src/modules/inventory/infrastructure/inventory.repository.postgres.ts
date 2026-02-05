import { InventoryRepository } from '../domain/inventory.repository';
import { Inventory } from '../domain/inventory.entity';
import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { PoolClient } from 'pg';

export class PostgresInventoryRepository implements InventoryRepository {

  async findByProductId(productId: string): Promise<Inventory | null> {
    const { rows } = await getPgPool().query(
      `
      SELECT product_id, available_quantity, reserved_quantity
      FROM inventory WHERE product_id = $1
      `,
      [productId]
    );

    const r = rows[0];
    return r
      ? new Inventory(r.product_id, r.available_quantity, r.reserved_quantity)
      : null;
  }

  async save(inv: Inventory, client?:PoolClient): Promise<void> {
    await getPgPool().query(
      `
      INSERT INTO inventory (product_id, available_quantity, reserved_quantity)
      VALUES ($1,$2,$3)
      ON CONFLICT (product_id)
      DO UPDATE SET
        available_quantity = $2,
        reserved_quantity = $3
      `,
      [
        inv['productId'],
        inv.getAvailable(),
        inv['reservedQuantity']
      ]
    );
  }
}
