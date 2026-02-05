import { CatalogRepository } from '../domain/catalog.repository';
import { Catalog } from '../domain/catalog.entity';
import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { PoolClient } from 'pg';

export class PostgresCatalogRepository implements CatalogRepository {

  async findAll(): Promise<Catalog[]> {
    const { rows } = await getPgPool().query(
      'SELECT id, name, active FROM catalogs'
    );
    return rows.map(r => new Catalog(r.id, r.name, r.active));
  }

  async findById(id: string): Promise<Catalog | null> {
    const { rows } = await getPgPool().query(
      'SELECT id, name, active FROM catalogs WHERE id = $1',
      [id]
    );
    return rows[0] ? new Catalog(rows[0].id, rows[0].name, rows[0].active) : null;
  }

  async save(c: Catalog, client?:PoolClient): Promise<void> {
    await getPgPool().query(
      `
      INSERT INTO catalogs (id, name, active)
      VALUES ($1,$2,$3)
      ON CONFLICT (id)
      DO UPDATE SET name=$2, active=$3
      `,
      [c.id, c.name, c['active']]
    );
  }
}
