import { CartRepository } from '../domain/cart.repository';
import { Cart } from '../domain/cart.entity';
import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { PoolClient } from 'pg';
import { CartMapper } from '../../../infrastructure/mappers/cart.mapper';

export class PostgresCartRepository implements CartRepository {

  async findActiveByCustomer(
    customerId: string,
    client?: PoolClient
  ): Promise<Cart | null> {

    const executor = client ?? getPgPool();

    const cartResult = await executor.query(
      `SELECT * FROM carts WHERE customer_id=$1 AND status='ACTIVE'`,
      [customerId]
    );

    if (!cartResult.rows.length) return null;

    const cartRow = cartResult.rows[0];

    const itemsResult = await executor.query(
      `SELECT * FROM cart_items WHERE cart_id=$1`,
      [cartRow.id]
    );

    return CartMapper.toDomain(cartRow, itemsResult.rows);
  }

  async save(cart: Cart, client?: PoolClient): Promise<void> {

    const executor = client ?? getPgPool();

    await executor.query(
      `UPDATE carts SET status=$1 WHERE id=$2`,
      [cart.getStatus, cart.id]
    );

    // simplificación: borrar y reinsertar items
    await executor.query(
      `DELETE FROM cart_items WHERE cart_id=$1`,
      [cart.id]
    );

    for (const item of cart.getItems()) {
      await executor.query(
        `
        INSERT INTO cart_items
        (id,cart_id,product_id,quantity,unit_price)
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          crypto.randomUUID(),
          cart.id,
          item.productId,
          item.quantity,
          item.unitPrice
        ]
      );
    }
  }
}
