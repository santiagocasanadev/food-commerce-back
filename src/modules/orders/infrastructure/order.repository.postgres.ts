import { OrderItem } from '../domain/order-item.entity';
import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { OrderRepository } from '../domain/orders.repository';
import { Order } from '../domain/orders.entity';
import { PoolClient } from 'pg';

export class PostgresOrderRepository implements OrderRepository {

  async save(order: Order, client?:PoolClient): Promise<void> {
    await getPgPool().query(
      `
      INSERT INTO orders (id, customer_id, status, total, created_at)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (id)
      DO UPDATE SET status = $3, total = $4
      `,
      [
        order.id,
        order.customerId,
        order.getStatus(),
        order.total,
        order.createdAt
      ]
    );

    await getPgPool().query('DELETE FROM order_items WHERE order_id = $1', [order.id]);

    for (const item of order.items) {
      await getPgPool().query(
        `
        INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          crypto.randomUUID(),
          order.id,
          item.productId,
          item.quantity,
          item.unitPrice
        ]
      );
    }
  }

  async findById(orderId: string): Promise<Order | null> {
    const { rows } = await getPgPool().query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );
    if (!rows[0]) return null;

    const items = await getPgPool().query(
      `
      SELECT product_id, quantity, unit_price
      FROM order_items WHERE order_id = $1
      `,
      [orderId]
    );

    return new Order(
      rows[0].id,
      rows[0].customer_id,
      rows[0].status,
      items.rows.map(
        i => new OrderItem(i.product_id, i.quantity, Number(i.unit_price))
      ),
      Number(rows[0].total),
      rows[0].created_at
    );
  }

  async findAll(): Promise<Order[]> {
    const { rows } = await getPgPool().query(
      'SELECT id FROM orders ORDER BY created_at DESC'
    );

    return Promise.all(rows.map(r => this.findById(r.id))) as Promise<Order[]>;
  }
}
