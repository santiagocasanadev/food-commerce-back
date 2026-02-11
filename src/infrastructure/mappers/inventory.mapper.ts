import { Inventory } from '../../modules/inventory/domain/inventory.entity';

export class InventoryMapper {

  static toDomain(row: any): Inventory {
    return new Inventory(
      row.product_id,
      row.available_quantity,
      row.reserved_quantity
    );
  }

  static toPersistence(inventory: Inventory) {
    return {
      product_id: inventory.productId,
      available_quantity: inventory.getAvailable(),
      reserved_quantity: inventory.getReserved()
    };
  }
}
