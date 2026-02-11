import { CatalogRepository } from '../domain/catalog.repository';
import { Catalog } from '../domain/catalog.entity';
import { getPgPool } from '../../../infrastructure/database/postgres.connection';
import { PoolClient } from 'pg';
import { CatalogMapper } from '../../../infrastructure/mappers/catalog.mapper';

export class PostgresCatalogRepository implements CatalogRepository {

  async findAll(client?: PoolClient): Promise<Catalog[]> {

    const executor = client ?? getPgPool();

    const { rows } = await executor.query(
      `SELECT * FROM catalogs`
    );

    return rows.map(row => CatalogMapper.toDomain(row));
  }

  async findById(id: string, client?: PoolClient): Promise<Catalog | null> {

    const executor = client ?? getPgPool();

    const { rows } = await executor.query(
      `SELECT * FROM catalogs WHERE id=$1`,
      [id]
    );

    if (!rows.length) return null;

    return CatalogMapper.toDomain(rows[0]);
  }

  async save(catalog: Catalog, client?: PoolClient): Promise<void> {

    const executor = client ?? getPgPool();
    const data = CatalogMapper.toPersistence(catalog);

    await executor.query(
      `
      INSERT INTO catalogs (id, name, active)
      VALUES ($1,$2,$3)
      ON CONFLICT (id)
      DO UPDATE SET name=$2, active=$3
      `,
      [data.id, data.name, data.active]
    );
  }
}
