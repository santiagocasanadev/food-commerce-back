import { Cart } from '../../modules/cart/domain/cart.entity';
import { CartItem } from '../../modules/cart/domain/cart-item.entity';

export class CartMapper {

  static toDomain(cartRow: any, itemRows: any[]): Cart {

    const cart = new Cart(
      cartRow.id,
      cartRow.customer_id,
      cartRow.status
    );

    for (const row of itemRows) {
      cart.addItem(
        new CartItem(
          row.product_id,
          row.quantity,
          row.unit_price
        )
      );
    }

    return cart;
  }

  static toPersistence(cart: Cart) {

    return {
      id: cart.id,
      customer_id: cart.customerId,
      status: cart.getStatus(),
    };
  }
}
