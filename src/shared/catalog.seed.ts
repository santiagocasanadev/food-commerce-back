import { Catalog } from "src/modules/catalog/domain/catalog.entity";

export const catalogSeed = [
  new Catalog('1', 'Vegano', true),
  new Catalog('2', 'Proteico', true),
];