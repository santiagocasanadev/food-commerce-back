import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { PoolClient } from 'pg';
import { OrderMapper } from '../../../infrastructure/mappers/order.mapper';
import type { OrderRepository } from '../domain/orders.repository';
import { Order } from '../domain/orders.entity';

export class PostgresOrderRepository implements OrderRepository {

  async save(order: Order, client?: PoolClient): Promise<void> {

    const executor = client ?? getPgPool();
    const data = OrderMapper.toPersistence(order);

    await executor.query(
      `
      INSERT INTO orders (id,customer_id,status,total,created_at)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [data.id, data.customer_id, data.status, data.total, data.created_at]
    );

    for (const item of order.items) {
      await executor.query(
        `
        INSERT INTO order_items
        (id,order_id,product_id,quantity,unit_price)
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

  async findById(id: string, client?: PoolClient): Promise<Order | null> {

    const executor = client ?? getPgPool();

    const orderResult = await executor.query(
      `SELECT * FROM orders WHERE id=$1`,
      [id]
    );

    if (!orderResult.rows.length) return null;

    const itemsResult = await executor.query(
      `SELECT * FROM order_items WHERE order_id=$1`,
      [id]
    );

    return OrderMapper.toDomain(
      orderResult.rows[0],
      itemsResult.rows
    );
  }

    async findAll(client?: PoolClient): Promise<Order[]> {

    const executor = client ?? getPgPool();
    const { rows } = await executor.query(
      'SELECT id FROM orders ORDER BY created_at DESC'
    );

    return Promise.all(rows.map(r => this.findById(r.id, executor))) as Promise<Order[]>;
  }
}
