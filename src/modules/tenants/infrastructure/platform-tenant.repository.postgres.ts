import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { getPlatformPool } from 'src/infrastructure/database/platform.connection';
import { PlatformTenant } from '../domain/platform-tenant.entity';

@Injectable()
export class PlatformTenantRepository {
  async findAll(): Promise<PlatformTenant[]> {
    const { rows } = await getPlatformPool().query(
      `
      SELECT id, slug, name, db_connection_url, active, created_at, updated_at
      FROM platform_tenants
      ORDER BY created_at DESC
      `,
    );

    return rows.map((row) => this.mapRow(row));
  }

  async findById(id: string): Promise<PlatformTenant | null> {
    const { rows } = await getPlatformPool().query(
      `
      SELECT id, slug, name, db_connection_url, active, created_at, updated_at
      FROM platform_tenants
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    );

    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<PlatformTenant | null> {
    const { rows } = await getPlatformPool().query(
      `
      SELECT id, slug, name, db_connection_url, active, created_at, updated_at
      FROM platform_tenants
      WHERE slug = $1
      LIMIT 1
      `,
      [slug],
    );

    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async create(data: {
    slug: string;
    name: string;
    dbConnectionUrl: string;
    active?: boolean;
  }): Promise<PlatformTenant> {
    const now = new Date();
    const { rows } = await getPlatformPool().query(
      `
      INSERT INTO platform_tenants (
        id,
        slug,
        name,
        db_connection_url,
        active,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, slug, name, db_connection_url, active, created_at, updated_at
      `,
      [
        crypto.randomUUID(),
        data.slug,
        data.name,
        data.dbConnectionUrl,
        data.active ?? true,
        now,
        now,
      ],
    );

    return this.mapRow(rows[0]);
  }

  async save(tenant: PlatformTenant): Promise<void> {
    await getPlatformPool().query(
      `
      UPDATE platform_tenants
      SET
        slug = $1,
        name = $2,
        db_connection_url = $3,
        active = $4,
        updated_at = NOW()
      WHERE id = $5
      `,
      [
        tenant.getSlug(),
        tenant.getName(),
        tenant.getDbConnectionUrl(),
        tenant.isActive(),
        tenant.id,
      ],
    );
  }

  async deleteById(id: string): Promise<void> {
    await getPlatformPool().query(
      `
      DELETE FROM platform_tenants
      WHERE id = $1
      `,
      [id],
    );
  }

  private mapRow(row: any): PlatformTenant {
    return new PlatformTenant(
      row.id,
      row.slug,
      row.name,
      row.db_connection_url,
      Boolean(row.active),
      new Date(row.created_at),
      new Date(row.updated_at),
    );
  }
}
