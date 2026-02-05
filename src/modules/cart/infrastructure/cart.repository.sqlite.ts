import { CartRepository } from '../domain/cart.repository';
import { Cart } from '../domain/cart.entity';
import { CartItem } from '../domain/cart-item.entity';
import { sqliteDb } from '../../../infrastructure/database/sqlite.connection';

export class SqliteCartRepository implements CartRepository {

  async findActiveByCustomer(customerId: string): Promise<Cart | null> {
    const cartRow = sqliteDb.prepare(`
      SELECT id, customer_id, status
      FROM carts
      WHERE customer_id = ? AND status = 'ACTIVE'
    `).get(customerId);

    if (!cartRow) return null;

    const itemRows = sqliteDb.prepare(`
      SELECT product_id, quantity, unit_price
      FROM cart_items
      WHERE cart_id = ?
    `).all(cartRow.id);

    const cart = new Cart(cartRow.id, cartRow.customer_id, cartRow.status);
    itemRows.forEach(r =>
      cart.addItem(new CartItem(r.product_id, r.quantity, r.unit_price))
    );

    return cart;
  }

  async save(cart: Cart): Promise<void> {
    sqliteDb.prepare(`
      INSERT INTO carts (id, customer_id, status)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status
    `).run(cart['id'], cart['customerId'], cart['status']);

    sqliteDb.prepare(`DELETE FROM cart_items WHERE cart_id = ?`)
      .run(cart['id']);

    const insertItem = sqliteDb.prepare(`
      INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price)
      VALUES (?, ?, ?, ?, ?)
    `);

    cart.getItems().forEach(i => {
      insertItem.run(
        crypto.randomUUID(),
        cart['id'],
        i.productId,
        i.quantity,
        i.unitPrice
      );
    });
  }
}
