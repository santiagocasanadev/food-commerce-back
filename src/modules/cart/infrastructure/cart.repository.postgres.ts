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

  async findActiveByGuest(guestId: string, client?: PoolClient): Promise<Cart | null> {

    const executor = client ?? getPgPool();

    const cartResult = await executor.query(
      `SELECT * FROM carts WHERE guest_id=$1 AND status='ACTIVE'`,
      [guestId]
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

    // verificar si existe
    const existing = await executor.query(
      `SELECT id FROM carts WHERE id=$1`,
      [cart.id]
    );

    if (!existing.rows.length) {
      // INSERT cart
      await executor.query(
        `
      INSERT INTO carts (id, customer_id, guest_id, status)
      VALUES ($1,$2,$3,$4)
      `,
        [cart.id, cart.getCustomerId(), cart.getGuestId(), cart.getStatus()]
      );
    } else {
      // UPDATE cart
      await executor.query(
        `
      UPDATE carts SET status=$1 WHERE id=$2
      `,
        [cart.getStatus(), cart.id]
      );
    }

    // borrar items actuales
    await executor.query(
      `DELETE FROM cart_items WHERE cart_id=$1`,
      [cart.id]
    );

    // reinsertar items
    for (const item of cart.getItems()) {
      await executor.query(
        `
      INSERT INTO cart_items
      (id, cart_id, product_id, quantity, unit_price)
      VALUES ($1,$2,$3,$4,$5)
      `,
        [
          crypto.randomUUID(),
          cart.id,
          item.productId,
          item.getQuantity(),
          item.unitPrice
        ]
      );
    }
  }

  async delete(cartId: string, client?: PoolClient): Promise<void> {

    const executor = client ?? getPgPool();

    await executor.query(
      `DELETE FROM cart_items WHERE cart_id=$1`,
      [cartId]
    );

    await executor.query(
      `DELETE FROM carts WHERE id=$1`,
      [cartId]
    );
  }

  async clearItems(cartId: string, client?: PoolClient): Promise<void> {

    const executor = client ?? getPgPool();

    await executor.query(
      `DELETE FROM cart_items WHERE cart_id=$1`,
      [cartId]
    );
  }
}
