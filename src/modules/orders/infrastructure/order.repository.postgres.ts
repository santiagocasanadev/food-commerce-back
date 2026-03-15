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
      INSERT INTO orders (id,customer_id,status,total,created_at,idempotency_key)
      VALUES ($1,$2,$3,$4,$5,$6)
      `,
      [data.id, data.customer_id, data.status, data.total, data.created_at, data.idempotency_key]
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

  
  async findByIdempotencyKey(key: string): Promise<Order | null> {
    const pool = getPgPool();
    const orderResult = await pool.query(
      `
    SELECT * FROM orders
    WHERE idempotency_key = $1
    LIMIT 1
    `,
      [key]
    );

    if (!orderResult.rows.length) return null;

    const orderRow = orderResult.rows[0];
    const itemsResult = await pool.query(
      `
    SELECT * FROM order_items
    WHERE order_id = $1
    `,
      [orderRow.id]
    );

    return OrderMapper.toDomain(orderRow, itemsResult.rows);
  }

  async findByCustomerPaginated(customerId: string, page: number, limit: number): Promise<{ data: Order[]; total: number }> {

    const offset = (page - 1) * limit;
    const executor = getPgPool();

    const ordersResult = await executor.query(
      `
    SELECT *
    FROM orders
    WHERE customer_id = $1
    ORDER BY created_at DESC
    LIMIT $2
    OFFSET $3
    `,
      [customerId, limit, offset]
    );

    if (!ordersResult.rows.length) {
      return { data: [], total: 0 };
    }

    const orderIds = ordersResult.rows.map(o => o.id);

    const itemsResult = await executor.query(
      `
    SELECT *
    FROM order_items
    WHERE order_id = ANY($1)
    `,
      [orderIds]
    );

    const itemsByOrder: Record<string, any[]> = {};

    for (const row of itemsResult.rows) {
      if (!itemsByOrder[row.order_id]) {
        itemsByOrder[row.order_id] = [];
      }
      itemsByOrder[row.order_id].push(row);
    }

    const orders = ordersResult.rows.map(orderRow =>
      OrderMapper.toDomain(
        orderRow,
        itemsByOrder[orderRow.id] ?? []
      )
    );

    const countResult = await executor.query(
      `
    SELECT COUNT(*) FROM orders
    WHERE customer_id = $1
    `,
      [customerId]
    );

    return {
      data: orders,
      total: Number(countResult.rows[0].count)
    };
  }
}
