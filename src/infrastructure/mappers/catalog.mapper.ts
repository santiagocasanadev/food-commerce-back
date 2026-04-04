import { Catalog } from '../../modules/catalog/domain/catalog.entity';

export class CatalogMapper {

  static toDomain(row: any): Catalog {
    return new Catalog(
      row.id,
      row.name,
      row.active
    );
  }

  static toPersistence(catalog: Catalog) {
    return {
      id: catalog.id,
      name: catalog.getName(),
      active: catalog.getStatus()
    };
  }
}
