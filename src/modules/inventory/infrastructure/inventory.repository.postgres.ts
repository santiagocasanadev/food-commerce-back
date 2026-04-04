import { InventoryRepository } from '../domain/inventory.repository';
import { PoolClient } from 'pg';
import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { InventoryMapper } from '../../../infrastructure/mappers/inventory.mapper';

export class PostgresInventoryRepository implements InventoryRepository {

  async findByProductId(productId: string, client?: PoolClient) {
    const executor = client ?? getPgPool();

    const { rows } = await executor.query(
      `SELECT * FROM inventory WHERE product_id=$1`,
      [productId]
    );

    if (!rows.length) return null;

    return InventoryMapper.toDomain(rows[0]);
  }

  async save(inventory: any, client?: PoolClient): Promise<void> {
    const executor = client ?? getPgPool();
    const data = InventoryMapper.toPersistence(inventory);

    await executor.query(
      `
      INSERT INTO inventory (product_id, available_quantity, reserved_quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (product_id)
      DO UPDATE SET
        available_quantity = $2,
        reserved_quantity = $3
      `,
      [data.product_id, data.available_quantity, data.reserved_quantity],
    );
  }

  async reserve(productId: string, quantity: number, client: PoolClient): Promise<void> {
    const result = await client.query(
      `
      SELECT available_quantity
      FROM inventory
      WHERE product_id=$1
      FOR UPDATE
      `,
      [productId]
    );

    if (!result.rows.length)
      throw new Error('Inventory not found');

    const available = result.rows[0].available_quantity;

    if (available < quantity)
      throw new Error('Insufficient stock');

    await client.query(
      `
      UPDATE inventory
      SET available_quantity = available_quantity - $1
      WHERE product_id=$2
      `,
      [quantity, productId]
    );
  }

  async adjust(productId: string, quantity: number, client?: PoolClient): Promise<void> {
    const executor = client ?? getPgPool();

    // Race Condition block
    const result = await executor.query(
      `
    SELECT available_quantity
    FROM inventory
    WHERE product_id = $1
    FOR UPDATE
    `,
      [productId]
    );

    if (!result.rows.length) {
      throw new Error('Inventory not found');
    }

    const newQuantity =
      result.rows[0].available_quantity + quantity;

    if (newQuantity < 0) {
      throw new Error('Inventory cannot be negative');
    }

    await executor.query(
      `
    UPDATE inventory
    SET available_quantity = $1
    WHERE product_id = $2
    `,
      [newQuantity, productId]
    );
  }

}
