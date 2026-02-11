import { Product } from "src/modules/products/domain/products.entity";


export class ProductMapper {

  static toDomain(row: any): Product {
    return new Product(
      row.id,
      row.name,
      row.description,
      row.base_price,
      row.active,
      row.catalog_id
    );
  }

  static toPersistence(product: Product) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      base_price: product.getBasePrice(),
      active: product.getStatus(),
      catalog_id: product.catalogId
    };
  }
}
