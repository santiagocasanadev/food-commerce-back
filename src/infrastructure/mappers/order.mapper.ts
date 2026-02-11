import { Order } from 'src/modules/orders/domain/orders.entity';
import { OrderItem } from '../../modules/orders/domain/order-item.entity';

export class OrderMapper {

  static toDomain(orderRow: any, itemRows: any[]): Order {

    const items = itemRows.map(row =>
      new OrderItem(
        row.product_id,
        row.quantity,
        row.unit_price
      )
    );

    return new Order(
      orderRow.id,
      orderRow.customer_id,
      orderRow.status,
      items,
      orderRow.total,
      new Date(orderRow.created_at)
    );
  }

  static toPersistence(order: Order) {

    return {
      id: order.id,
      customer_id: order.customerId,
      status: order.getStatus(),
      total: order.total,
      created_at: order.createdAt
    };
  }
}
