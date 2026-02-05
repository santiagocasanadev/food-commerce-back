import { PoolClient } from 'pg';
import { Catalog } from "../domain/catalog.entity";

export interface CatalogRepository {
    findAll(): Promise<Catalog[]>;
    findById(id: string): Promise<Catalog | null>;
    save(catalog: Catalog, client?:PoolClient): Promise<void>;
}