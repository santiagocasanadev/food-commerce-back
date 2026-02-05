import { CartRepository } from '../domain/cart.repository';
import { Cart } from '../domain/cart.entity';
import { CartItem } from '../domain/cart-item.entity';
import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { PoolClient } from 'pg';

export class PostgresCartRepository implements CartRepository {

  async findActiveByCustomer(customerId: string): Promise<Cart | null> {
    const { rows } = await getPgPool().query(
      `
      SELECT id, status
      FROM carts
      WHERE customer_id = $1 AND status = 'ACTIVE'
      `,
      [customerId]
    );

    const cartRow = rows[0];
    if (!cartRow) return null;

    const items = await getPgPool().query(
      `
      SELECT product_id, quantity, unit_price
      FROM cart_items WHERE cart_id = $1
      `,
      [cartRow.id]
    );

    const cart = new Cart(cartRow.id, customerId, cartRow.status);
    items.rows.forEach(i =>
      cart.addItem(new CartItem(i.product_id, i.quantity, Number(i.unit_price)))
    );

    return cart;
  }

  async save(cart: Cart, client?:PoolClient): Promise<void> {
    await getPgPool().query(
      `
      INSERT INTO carts (id, customer_id, status)
      VALUES ($1,$2,$3)
      ON CONFLICT (id)
      DO UPDATE SET status = $3
      `,
      [cart['id'], cart['customerId'], cart['status']]
    );

    await getPgPool().query('DELETE FROM cart_items WHERE cart_id = $1', [cart['id']]);

    for (const item of cart.getItems()) {
      await getPgPool().query(
        `
        INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price)
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          crypto.randomUUID(),
          cart['id'],
          item.productId,
          item.quantity,
          item.unitPrice
        ]
      );
    }
  }
}
