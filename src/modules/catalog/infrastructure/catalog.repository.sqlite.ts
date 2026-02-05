import { CatalogRepository } from '../domain/catalog.repository';
import { Catalog } from '../domain/catalog.entity';
import { sqliteDb } from '../../../infrastructure/database/sqlite.connection';

export class SqliteCatalogRepository implements CatalogRepository {

  async findAll(): Promise<Catalog[]> {
    const rows = sqliteDb.prepare(
      'SELECT id, name, active FROM catalogs'
    ).all();
    return rows.map(r => new Catalog(r.id, r.name, !!r.active));
  }

  async findById(id: string): Promise<Catalog | null> {
    const r = sqliteDb.prepare(
      'SELECT id, name, active FROM catalogs WHERE id = ?'
    ).get(id);
    return r ? new Catalog(r.id, r.name, !!r.active) : null;
  }

  async save(c: Catalog): Promise<void> {
    sqliteDb.prepare(`
      INSERT INTO catalogs (id, name, active)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        active = excluded.active
    `).run(c.id, c.name, c['active'] ? 1 : 0);
  }
}
