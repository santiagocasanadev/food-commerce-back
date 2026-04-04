import { Cart } from '../../modules/cart/domain/cart.entity';
import { CartItem } from '../../modules/cart/domain/cart-item.entity';

export class CartMapper {

  static toDomain(cartRow: any, itemRows: any[]): Cart {

    const items: CartItem[] = [];

    for (const row of itemRows) {
      items.push(
        new CartItem(
          row.product_id,
          row.quantity,
          row.unit_price
        )
      );
    }

    return new Cart(
      cartRow.id,
      cartRow.customer_id ?? null,
      cartRow.guest_id ?? null,
      cartRow.status,
      items
    );
  }

  static toPersistence(cart: Cart) {

    return {
      id: cart.id,
      customer_id: cart.getCustomerId(),
      guest_id: cart.getGuestId(),
      status: cart.getStatus(),
    };
  }
}
