import { OrderItem } from '../domain/order-item.entity';
import { sqliteDb } from '../../../infrastructure/database/sqlite.connection';
import { OrderRepository } from '../domain/orders.repository';
import { Order } from '../domain/orders.entity';

export class SqliteOrderRepository implements OrderRepository {

  async save(order: Order): Promise<void> {
    sqliteDb.prepare(`
      INSERT INTO orders (id, customer_id, status, total, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        total = excluded.total
    `).run(
      order.id,
      order.customerId,
      order.getStatus(),
      order.total,
      order.createdAt.toISOString()
    );

    sqliteDb.prepare(`DELETE FROM order_items WHERE order_id = ?`)
      .run(order.id);

    const insertItem = sqliteDb.prepare(`
      INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
      VALUES (?, ?, ?, ?, ?)
    `);

    order.items.forEach(i => {
      insertItem.run(
        crypto.randomUUID(),
        order.id,
        i.productId,
        i.quantity,
        i.unitPrice
      );
    });
  }

  async findById(orderId: string): Promise<Order | null> {
    const row = sqliteDb.prepare(`
      SELECT id, customer_id, status, total, created_at
      FROM orders WHERE id = ?
    `).get(orderId);

    if (!row) return null;

    const items = sqliteDb.prepare(`
      SELECT product_id, quantity, unit_price
      FROM order_items WHERE order_id = ?
    `).all(orderId).map(
      r => new OrderItem(r.product_id, r.quantity, r.unit_price)
    );

    return new Order(
      row.id,
      row.customer_id,
      row.status,
      items,
      row.total,
      new Date(row.created_at)
    );
  }

  async findAll(): Promise<Order[]> {
    const rows = sqliteDb.prepare(`
      SELECT id FROM orders ORDER BY created_at DESC
    `).all();

    return Promise.all(rows.map(r => this.findById(r.id))) as Promise<Order[]>;
  }
}
