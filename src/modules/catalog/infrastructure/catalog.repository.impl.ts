import { Catalog } from "../domain/catalog.entity";
import { CatalogRepository } from "../domain/catalog.repository";

export class InMemoryCatalogRepository implements CatalogRepository {

    private readonly store = new Map<string, Catalog>();
    
    async findAll(): Promise<Catalog[]> {
        return [
            new Catalog('1', 'Vegano', true),
            new Catalog('2', 'Proteico', true),
        ];
    }

    async findById(id: string): Promise<Catalog | null> {
        return this.store.get(id) ?? null;
    }

    async save(catalog: Catalog): Promise<void> {
        this.store.set(catalog.id, catalog);
    }
}